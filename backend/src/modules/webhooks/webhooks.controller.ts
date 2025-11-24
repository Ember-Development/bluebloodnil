import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

type BombersWebhookEvent =
  | {
      type: 'athlete.created' | 'athlete.updated';
      data: {
        id: string;
        email: string;
        name: string;
        position?: string;
        school?: string;
        classYear?: number;
        bio?: string;
        nilScore?: number;
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

      await prisma.user.upsert({
        where: { externalId: data.id },
        update: {
          email: data.email,
          athlete: {
            update: {
              name: data.name,
              position: data.position,
              school: data.school,
              classYear: data.classYear ?? undefined,
              bio: data.bio,
              nilScore: data.nilScore ?? undefined
            }
          }
        },
        create: {
          email: data.email,
          role: 'ATHLETE',
          externalId: data.id,
          athlete: {
            create: {
              name: data.name,
              position: data.position,
              school: data.school,
              classYear: data.classYear ?? undefined,
              bio: data.bio,
              nilScore: data.nilScore ?? undefined
            }
          }
        }
      });
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

