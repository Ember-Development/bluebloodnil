import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendMagicLinkEmail } from "../../services/email.service";

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        athlete: {
          include: {
            socialProfiles: true,
            interests: true,
            parentContacts: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const athlete = user.athlete;
    // Admins and other non-athlete roles don't need onboarding
    const profileComplete =
      user.role !== "ATHLETE" ? true : (athlete?.profileComplete ?? false);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profileComplete,
      athlete: athlete
        ? {
            id: athlete.id,
            name: athlete.name,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            position: athlete.position,
            position1: athlete.position1,
            position2: athlete.position2,
            school: athlete.school,
            teamName: athlete.teamName,
            jerseyNumber: athlete.jerseyNumber,
            classYear: athlete.classYear,
            gradYear: athlete.gradYear,
            ageGroup: athlete.ageGroup,
            address: athlete.address,
            location: athlete.location,
            bio: athlete.bio,
            sport: athlete.sport,
            primaryPosition: athlete.primaryPosition,
            avatarUrl: athlete.avatarUrl,
            nilScore: athlete.nilScore,
            profileComplete: athlete.profileComplete,
            socialProfiles: athlete.socialProfiles,
            interests: athlete.interests,
            parentContacts: athlete.parentContacts,
          }
        : null,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function requestMagicLink(req: Request, res: Response) {
  try {
    const { email } = req.body as { email?: string };

    console.log(`[Auth] Login request for email: ${email}`);

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.log(`[Auth] User not found for email: ${normalizedEmail}`);
      // Don't reveal if user exists or not for security
      // Return success anyway to prevent email enumeration
      return res.json({
        success: true,
        message:
          "If an account exists with that email, a magic link has been sent.",
      });
    }

    console.log(`[Auth] User found: ${user.id} (${user.email})`);

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing tokens for this email
    await prisma.magicLinkToken.deleteMany({
      where: {
        email: normalizedEmail,
        used: false,
      },
    });

    // Create new magic link token
    await prisma.magicLinkToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    // Send email (in production) or log (in development)
    console.log(`[Auth] Sending magic link email to: ${normalizedEmail}`);
    await sendMagicLinkEmail(normalizedEmail, token);
    console.log(`[Auth] Magic link email sent successfully`);

    res.json({
      success: true,
      message:
        "If an account exists with that email, a magic link has been sent.",
    });
  } catch (error) {
    console.error("[Auth] Request magic link error:", error);
    console.error(
      "[Auth] Error details:",
      error instanceof Error ? error.message : String(error)
    );
    res.status(500).json({ error: "Failed to send magic link" });
  }
}

export async function verifyMagicLink(req: Request, res: Response) {
  try {
    const token = req.params?.token;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Find token
    const magicLink = await prisma.magicLinkToken.findUnique({
      where: { token },
    });

    if (!magicLink) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Check if expired
    if (new Date() > magicLink.expiresAt) {
      await prisma.magicLinkToken.update({
        where: { id: magicLink.id },
        data: { used: true },
      });
      return res.status(400).json({ error: "This link has expired" });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: magicLink.email },
      include: {
        athlete: {
          select: { id: true, profileComplete: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If token is already used, check if user is already authenticated
    // If so, return success anyway (user might have clicked link multiple times)
    if (magicLink.used) {
      // Return success with user info - they're already signed in
      const profileComplete =
        user.role !== "ATHLETE"
          ? true
          : (user.athlete?.profileComplete ?? false);
      return res.json({
        success: true,
        userId: user.id,
        profileComplete,
        alreadyUsed: true, // Flag to indicate token was already used
      });
    }

    // Mark token as used
    await prisma.magicLinkToken.update({
      where: { id: magicLink.id },
      data: { used: true },
    });

    // Admins and other non-athlete roles don't need onboarding
    const profileComplete =
      user.role !== "ATHLETE" ? true : (user.athlete?.profileComplete ?? false);

    res.json({
      success: true,
      userId: user.id,
      profileComplete,
    });
  } catch (error) {
    console.error("Verify magic link error:", error);
    res.status(500).json({ error: "Failed to verify magic link" });
  }
}
