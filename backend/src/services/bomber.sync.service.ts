// bomber.sync.service.ts
import { prisma } from "../config/prisma";
import {
  fetchNilAthletesFromBomber,
  BomberNilAthlete,
  fetchAdminsFromBomber,
  BomberAdmin,
} from "./bomber.client";

function guessSportFromTeam(teamName?: string | null): string | undefined {
  if (!teamName) return undefined;
  return "Softball";
}

export async function syncBomberNilAthletes() {
  const athletes = await fetchNilAthletesFromBomber(); // BomberNilAthlete[]

  for (const a of athletes) {
    const fullName = `${a.user.fname} ${a.user.lname}`.trim();
    const teamName = a.team?.name ?? undefined;
    const normalizedEmail = a.user.email?.toLowerCase().trim() ?? "";

    // Format address if available
    let formattedAddress: string | undefined = undefined;
    let formattedLocation: string | undefined = undefined;
    if (a.address) {
      const parts = [
        a.address.address1,
        a.address.address2,
        `${a.address.city}, ${a.address.state} ${a.address.zip}`,
      ].filter(Boolean);
      formattedAddress = parts.join(", ");

      // Set location from city and state
      if (a.address.city && a.address.state) {
        formattedLocation = `${a.address.city}, ${a.address.state}`;
      }
    }

    // 1) Upsert User
    const user = await prisma.user.upsert({
      where: { externalId: a.user.id },
      update: {
        email: normalizedEmail,
      },
      create: {
        email: normalizedEmail,
        role: "ATHLETE",
        externalId: a.user.id,
      },
    });

    // 2) Upsert AthleteProfile
    const athleteProfile = await prisma.athleteProfile.upsert({
      where: { userId: user.id },
      update: {
        name: fullName,
        firstName: a.user.fname,
        lastName: a.user.lname,
        position1: a.pos1,
        position2: a.pos2,
        teamName,
        jerseyNumber: parseInt(a.jerseyNum, 10) || undefined,
        classYear: parseInt(a.gradYear, 10) || undefined,
        gradYear: parseInt(a.gradYear, 10) || undefined,
        ageGroup: a.ageGroup,
        school: a.college ?? undefined,
        sport: guessSportFromTeam(teamName),
        primaryPosition: a.pos1,
        profileComplete: false,
        address: formattedAddress,
        location: formattedLocation, // Add this line
      },
      create: {
        userId: user.id,
        name: fullName,
        firstName: a.user.fname,
        lastName: a.user.lname,
        position1: a.pos1,
        position2: a.pos2,
        teamName,
        jerseyNumber: parseInt(a.jerseyNum, 10) || undefined,
        classYear: parseInt(a.gradYear, 10) || undefined,
        gradYear: parseInt(a.gradYear, 10) || undefined,
        ageGroup: a.ageGroup,
        school: a.college ?? undefined,
        sport: guessSportFromTeam(teamName),
        primaryPosition: a.pos1,
        profileComplete: false,
        address: formattedAddress,
        location: formattedLocation, // Add this line
      },
    });

    // 3) Sync ParentContacts
    await prisma.parentContact.deleteMany({
      where: { athleteId: athleteProfile.id },
    });

    for (const parent of a.parents) {
      await prisma.parentContact.create({
        data: {
          athleteId: athleteProfile.id,
          firstName: parent.user.fname,
          lastName: parent.user.lname,
          email: parent.user.email ?? undefined,
          phone: parent.user.phone ?? undefined,
          relationship: "Parent",
        },
      });
    }
  }

  return { count: athletes.length };
}

export async function syncBomberAdmins() {
  const admins = await fetchAdminsFromBomber(); // BomberAdmin[]

  for (const admin of admins) {
    const normalizedEmail = admin.email?.toLowerCase().trim() ?? "";

    // Upsert User with ADMIN role
    await prisma.user.upsert({
      where: { externalId: admin.id },
      update: {
        email: normalizedEmail,
        role: "ADMIN",
        firstName: admin.fname || null,
        lastName: admin.lname || null,
      },
      create: {
        email: normalizedEmail,
        role: "ADMIN",
        externalId: admin.id,
        firstName: admin.fname || null,
        lastName: admin.lname || null,
      },
    });
  }

  return { count: admins.length };
}
