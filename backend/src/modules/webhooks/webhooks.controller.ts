import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

type BombersWebhookEvent =
  | {
      type: 'athlete.created' | 'athlete.updated';
      data: {
        id: string;
        fname: string;
        lname: string;
        email: string;
        teamName?: string;
        pos1?: string;
        pos2?: string;
        jerseyNum?: number;
        gradYear?: number;
        ageGroup?: string;
        address?: string;
        parentInfo?: {
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string;
          relationship?: string;
        };
      };
    }
  | {
      type: 'organization.created' | 'organization.updated';
      data: {
        id: string;
        name: string;
        logoUrl?: string;
        tier?: string;
      };
    };

export async function handleBombersWebhook(req: Request, res: Response) {
  const event = req.body as BombersWebhookEvent;

  try {
    if (event.type === 'athlete.created' || event.type === 'athlete.updated') {
      const { data } = event;
      const fullName = `${data.fname} ${data.lname}`.trim();

      // Upsert user and athlete profile
      const user = await prisma.user.upsert({
        where: { externalId: data.id },
        update: {
          email: data.email,
        },
        create: {
          email: data.email,
          role: 'ATHLETE',
          externalId: data.id,
        },
        include: {
          athlete: true,
        },
      });

      // Upsert athlete profile
      const athlete = await prisma.athleteProfile.upsert({
        where: { userId: user.id },
        update: {
          name: fullName,
          firstName: data.fname,
          lastName: data.lname,
          position1: data.pos1,
          position2: data.pos2,
          teamName: data.teamName,
          jerseyNumber: data.jerseyNum,
          gradYear: data.gradYear,
          classYear: data.gradYear, // Keep both for compatibility
          ageGroup: data.ageGroup,
          address: data.address,
        },
        create: {
          userId: user.id,
          name: fullName,
          firstName: data.fname,
          lastName: data.lname,
          position1: data.pos1,
          position2: data.pos2,
          teamName: data.teamName,
          jerseyNumber: data.jerseyNum,
          gradYear: data.gradYear,
          classYear: data.gradYear,
          ageGroup: data.ageGroup,
          address: data.address,
        },
      });

      // Handle parent contact info if provided
      if (data.parentInfo) {
        const parentInfo = data.parentInfo;
        if (parentInfo.firstName && parentInfo.lastName) {
          // Check if parent contact already exists for this athlete
          const existingParent = await prisma.parentContact.findFirst({
            where: {
              athleteId: athlete.id,
              firstName: parentInfo.firstName,
              lastName: parentInfo.lastName,
            },
          });

          if (existingParent) {
            await prisma.parentContact.update({
              where: { id: existingParent.id },
              data: {
                email: parentInfo.email,
                phone: parentInfo.phone,
                relationship: parentInfo.relationship,
              },
            });
          } else {
            await prisma.parentContact.create({
              data: {
                athleteId: athlete.id,
                firstName: parentInfo.firstName,
                lastName: parentInfo.lastName,
                email: parentInfo.email,
                phone: parentInfo.phone,
                relationship: parentInfo.relationship,
              },
            });
          }
        }
      }
    }

    if (event.type === 'organization.created' || event.type === 'organization.updated') {
      const { data } = event;

      await prisma.organization.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          logoUrl: data.logoUrl,
          tier: data.tier
        },
        create: {
          id: data.id,
          name: data.name,
          logoUrl: data.logoUrl,
          tier: data.tier
        }
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handling error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

