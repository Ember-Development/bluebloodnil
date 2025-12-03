import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createFeedPost, createCampaignRecapPost, createAthleteCampaignPost } from '../../services/feed.service';
import { createNotification, createNotificationsForUsers } from '../../services/notification.service';

// ===== Organization (Brand) Management =====

export async function getAllOrganizations(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(organizations.map(org => ({
      ...org,
      campaignsCount: org._count.campaigns,
    })));
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
}

export async function createOrganization(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, logoUrl, tier } = req.body as {
      name?: string;
      logoUrl?: string;
      tier?: string;
    };

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        logoUrl: logoUrl || null,
        tier: tier || null,
      },
    });

    // Create feed post for new brand
    try {
      await createFeedPost({
        type: 'ORG_ANNOUNCEMENT',
        headline: `New brand partner: ${name}`,
        body: `${name} has joined the BlueBlood NIL platform${tier ? ` as a ${tier} tier partner` : ''}. We're excited to work together on NIL opportunities for our athletes.`,
        tags: ['Brand', 'Partnership', tier || 'New Partner'].filter(Boolean),
        authorName: 'BlueBloods NIL Desk',
        authorRole: 'Org NIL & Partnerships',
        authorAvatarUrl: 'https://placehold.co/64x64',
        authorOrg: 'BlueBloods Select',
        organizationId: organization.id,
      });
    } catch (error) {
      console.error('Failed to create feed post for organization:', error);
      // Don't fail the request if feed post creation fails
    }

    // Create notification for all users
    try {
      await createNotification({
        userId: null, // Broadcast to all users
        type: 'BRAND_ADDED',
        title: `New Brand Partner: ${name}`,
        message: `${name} has joined the platform${tier ? ` as a ${tier} tier partner` : ''}. Check out new campaign opportunities!`,
        linkUrl: `/athletes`,
      });
    } catch (error) {
      console.error('Failed to create notification for organization:', error);
      // Don't fail the request if notification creation fails
    }

    res.json(organization);
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
}

export async function updateOrganization(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, logoUrl, tier } = req.body as {
      name?: string;
      logoUrl?: string;
      tier?: string;
    };

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
        ...(tier !== undefined && { tier: tier || null }),
      },
    });

    res.json(organization);
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
}

export async function deleteOrganization(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    await prisma.organization.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
}

// ===== Campaign Management =====

export async function getAllCampaigns(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const campaigns = await prisma.campaign.findMany({
      include: {
        organization: true,
        participants: {
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: [
            { status: 'asc' }, // APPLIED first, then ACCEPTED, etc.
            { appliedAt: 'desc' }, // Most recent applications first
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
}

export async function createCampaign(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      title,
      description,
      organizationId,
      athleteIds,
      status,
      type,
      isOpen,
      address,
      totalEarnings,
      earningsSplitMethod,
      athleteEarnings,
    } = req.body as {
      title?: string;
      description?: string;
      organizationId?: string;
      athleteIds?: string[];
      status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
      type?: 'SOCIAL_MEDIA_POST' | 'COMMERCIAL_VIDEO' | 'IN_PERSON_APPEARANCE' | 'PRODUCT_ENDORSEMENT' | 'AUTOGRAPH_SIGNING' | 'SPEAKING_ENGAGEMENT' | 'PHOTO_SHOOT' | 'PARTNERSHIP';
      isOpen?: boolean;
      address?: string;
      totalEarnings?: number;
      earningsSplitMethod?: 'EQUAL' | 'CUSTOM';
      athleteEarnings?: Record<string, number>;
    };

    if (!title || !organizationId || !type) {
      return res.status(400).json({ error: 'Title, organizationId, and type are required' });
    }

    // Require address for in-person campaigns
    if (type === 'IN_PERSON_APPEARANCE' && !address) {
      return res.status(400).json({ error: 'Address is required for in-person campaigns' });
    }

    // Validate earnings split
    if (totalEarnings && earningsSplitMethod === 'CUSTOM' && athleteIds && athleteIds.length > 0) {
      if (!athleteEarnings || Object.keys(athleteEarnings).length !== athleteIds.length) {
        return res.status(400).json({ error: 'athleteEarnings mapping required for CUSTOM split method' });
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description: description || null,
        organizationId,
        type,
        status: status || 'DRAFT',
        isOpen: isOpen || false,
        address: address || null,
        totalEarnings: totalEarnings || null,
        earningsSplitMethod: earningsSplitMethod || 'EQUAL',
        participants: athleteIds && athleteIds.length > 0 ? {
          create: athleteIds.map(athleteId => {
            let earnings = null;
            if (totalEarnings) {
              if (earningsSplitMethod === 'CUSTOM' && athleteEarnings) {
                earnings = athleteEarnings[athleteId] || null;
              } else if (earningsSplitMethod === 'EQUAL') {
                earnings = totalEarnings / athleteIds.length;
              }
            }
            return {
              athleteId,
              status: 'INVITED',
              earnings,
            };
          }),
        } : undefined,
      },
      include: {
        organization: true,
        participants: {
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Create feed post for new campaign
    try {
      const statusMap: Record<string, 'planning' | 'live' | 'wrapped'> = {
        'DRAFT': 'planning',
        'ACTIVE': 'live',
        'COMPLETED': 'wrapped',
        'ARCHIVED': 'wrapped',
      };

      await createFeedPost({
        type: 'CAMPAIGN',
        headline: campaign.participants.length > 0
          ? `${campaign.organization.name} campaign: ${title} — ${campaign.participants.length} athlete${campaign.participants.length !== 1 ? 's' : ''} invited`
          : campaign.isOpen
            ? `New open campaign: ${title} from ${campaign.organization.name}`
            : `New campaign: ${title} from ${campaign.organization.name}`,
        body: description || `A new NIL campaign opportunity from ${campaign.organization.name}.${campaign.participants.length > 0 ? ` ${campaign.participants.length} athlete${campaign.participants.length !== 1 ? 's have' : ' has'} been invited to participate.` : campaign.isOpen ? ' Athletes can apply to participate.' : ''}`,
        tags: ['Campaign', campaign.organization.name, status || 'Draft'].filter(Boolean),
        authorName: campaign.organization.name,
        authorRole: 'Partner Brand',
        authorAvatarUrl: campaign.organization.logoUrl || 'https://placehold.co/64x64',
        authorOrg: campaign.organization.name,
        brand: campaign.organization.name,
        brandLogoUrl: campaign.organization.logoUrl || 'https://placehold.co/56x56',
        objective: description || 'New campaign opportunity',
        campaignStatus: statusMap[status || 'DRAFT'] || 'planning',
        campaignId: campaign.id,
        organizationId: campaign.organizationId,
        isOpen: campaign.isOpen,
      });
    } catch (error) {
      console.error('Failed to create feed post for campaign:', error);
      // Don't fail the request if feed post creation fails
    }

    // Create notifications and congratulatory feed posts
    try {
      if (campaign.participants.length > 0) {
        // Notify assigned athletes
        const athleteUserIds = await prisma.user.findMany({
          where: {
            athlete: {
              id: {
                in: campaign.participants.map(p => p.athlete.id),
              },
            },
          },
          select: { id: true },
        });

        if (athleteUserIds.length > 0) {
          await createNotificationsForUsers(
            athleteUserIds.map(u => u.id),
            {
              type: 'CAMPAIGN_ASSIGNED',
              title: `New Campaign: ${title}`,
              message: `You've been invited to participate in a campaign with ${campaign.organization.name}. Check your campaigns for details.`,
              linkUrl: `/athletes/${campaign.participants[0]?.athlete.id}`,
              campaignId: campaign.id,
            }
          );
        }

        // Create congratulatory feed posts for each assigned athlete
        const campaignTypeLabels: Record<string, string> = {
          SOCIAL_MEDIA_POST: 'Social Media Post',
          COMMERCIAL_VIDEO: 'Commercial Video',
          IN_PERSON_APPEARANCE: 'In-Person Appearance',
          PRODUCT_ENDORSEMENT: 'Product Endorsement',
          AUTOGRAPH_SIGNING: 'Autograph Signing',
          SPEAKING_ENGAGEMENT: 'Speaking Engagement',
          PHOTO_SHOOT: 'Photo Shoot',
          PARTNERSHIP: 'Partnership',
        };

        await Promise.all(
          campaign.participants.map(async (participant) => {
            try {
              await createAthleteCampaignPost({
                athleteId: participant.athlete.id,
                athleteName: participant.athlete.name,
                athleteAvatarUrl: participant.athlete.avatarUrl || undefined,
                campaignId: campaign.id,
                campaignTitle: campaign.title,
                organizationName: campaign.organization.name,
                organizationId: campaign.organizationId,
                organizationLogoUrl: campaign.organization.logoUrl || undefined,
                campaignType: campaignTypeLabels[type] || type,
                earnings: participant.earnings || undefined,
              });
            } catch (error) {
              console.error(`Failed to create feed post for athlete ${participant.athlete.id}:`, error);
              // Don't fail the request if individual post creation fails
            }
          })
        );
      }

      // Create broadcast notification for all users about new campaign
      await createNotification({
        userId: null, // Broadcast to all users
        type: 'CAMPAIGN_CREATED',
        title: `New Campaign: ${title}`,
        message: `${campaign.organization.name} has launched a new NIL campaign${campaign.participants.length > 0 ? ` with ${campaign.participants.length} athlete${campaign.participants.length !== 1 ? 's' : ''}` : ''}.`,
        linkUrl: `/feed`,
        campaignId: campaign.id,
      });
    } catch (error) {
      console.error('Failed to create notifications for campaign:', error);
      // Don't fail the request if notification creation fails
    }

    res.json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
}

export async function updateCampaign(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const {
      title,
      description,
      status,
      type,
      isOpen,
      address,
      totalEarnings,
      earningsSplitMethod,
      athleteEarnings,
    } = req.body as {
      title?: string;
      description?: string;
      status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
      type?: 'SOCIAL_MEDIA_POST' | 'COMMERCIAL_VIDEO' | 'IN_PERSON_APPEARANCE' | 'PRODUCT_ENDORSEMENT' | 'AUTOGRAPH_SIGNING' | 'SPEAKING_ENGAGEMENT' | 'PHOTO_SHOOT' | 'PARTNERSHIP';
      isOpen?: boolean;
      address?: string;
      totalEarnings?: number;
      earningsSplitMethod?: 'EQUAL' | 'CUSTOM';
      athleteEarnings?: Record<string, number>;
    };

    // Get existing campaign to check type
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const finalType = type || existingCampaign.type;
    if (finalType === 'IN_PERSON_APPEARANCE' && address === undefined && !existingCampaign.address) {
      return res.status(400).json({ error: 'Address is required for in-person campaigns' });
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(status && { status }),
        ...(type && { type }),
        ...(isOpen !== undefined && { isOpen }),
        ...(address !== undefined && { address: address || null }),
        ...(totalEarnings !== undefined && { totalEarnings: totalEarnings || null }),
        ...(earningsSplitMethod && { earningsSplitMethod }),
      },
      include: {
        organization: true,
        participants: {
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Update participant earnings if earningsSplitMethod or totalEarnings changed
    if ((earningsSplitMethod || totalEarnings !== undefined) && campaign.participants.length > 0) {
      const finalTotalEarnings = totalEarnings !== undefined ? totalEarnings : campaign.totalEarnings;
      const finalSplitMethod = earningsSplitMethod || campaign.earningsSplitMethod;

      if (finalTotalEarnings) {
        const updatePromises = campaign.participants.map(participant => {
          let earnings = null;
          if (finalSplitMethod === 'CUSTOM' && athleteEarnings) {
            earnings = athleteEarnings[participant.athleteId] || null;
          } else if (finalSplitMethod === 'EQUAL') {
            earnings = finalTotalEarnings / campaign.participants.length;
          }

          return prisma.campaignParticipant.update({
            where: { id: participant.id },
            data: { earnings },
          });
        });

        await Promise.all(updatePromises);
      }
    }

    // Fetch updated campaign with earnings
    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: true,
        participants: {
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedCampaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
}

export async function assignAthletesToCampaign(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { athleteIds, athleteEarnings } = req.body as {
      athleteIds: string[];
      athleteEarnings?: Record<string, number>;
    };

    if (!Array.isArray(athleteIds)) {
      return res.status(400).json({ error: 'athleteIds must be an array' });
    }

    // Get campaign to check earnings settings
    const campaignData = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaignData) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Remove existing participants
    await prisma.campaignParticipant.deleteMany({
      where: { campaignId: id },
    });

    // Create new participants with earnings
    if (athleteIds.length > 0) {
      const participantsData = athleteIds.map(athleteId => {
        let earnings = null;
        if (campaignData.totalEarnings) {
          if (campaignData.earningsSplitMethod === 'CUSTOM' && athleteEarnings) {
            earnings = athleteEarnings[athleteId] || null;
          } else if (campaignData.earningsSplitMethod === 'EQUAL') {
            earnings = campaignData.totalEarnings / athleteIds.length;
          }
        }
        return {
          campaignId: id,
          athleteId,
          status: 'INVITED' as const,
          earnings,
        };
      });

      await prisma.campaignParticipant.createMany({
        data: participantsData,
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: true,
        participants: {
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Create notifications and congratulatory feed posts for assigned athletes
    if (athleteIds.length > 0) {
      try {
        const athleteUserIds = await prisma.user.findMany({
          where: {
            athlete: {
              id: {
                in: athleteIds,
              },
            },
          },
          select: { id: true },
        });

        if (athleteUserIds.length > 0) {
          await createNotificationsForUsers(
            athleteUserIds.map(u => u.id),
            {
              type: 'CAMPAIGN_ASSIGNED',
              title: `Campaign Assignment: ${campaign.title}`,
              message: `You've been assigned to a campaign with ${campaign.organization.name}. Check your campaigns for details.`,
              linkUrl: `/athletes/${athleteIds[0]}`,
              campaignId: campaign.id,
            }
          );
        }

        // Create congratulatory feed posts for each assigned athlete
        const campaignTypeLabels: Record<string, string> = {
          SOCIAL_MEDIA_POST: 'Social Media Post',
          COMMERCIAL_VIDEO: 'Commercial Video',
          IN_PERSON_APPEARANCE: 'In-Person Appearance',
          PRODUCT_ENDORSEMENT: 'Product Endorsement',
          AUTOGRAPH_SIGNING: 'Autograph Signing',
          SPEAKING_ENGAGEMENT: 'Speaking Engagement',
          PHOTO_SHOOT: 'Photo Shoot',
          PARTNERSHIP: 'Partnership',
        };

        await Promise.all(
          campaign.participants.map(async (participant) => {
            try {
              await createAthleteCampaignPost({
                athleteId: participant.athlete.id,
                athleteName: participant.athlete.name,
                athleteAvatarUrl: participant.athlete.avatarUrl || undefined,
                campaignId: campaign.id,
                campaignTitle: campaign.title,
                organizationName: campaign.organization.name,
                organizationId: campaign.organizationId,
                organizationLogoUrl: campaign.organization.logoUrl || undefined,
                campaignType: campaignTypeLabels[campaign.type] || campaign.type,
                earnings: participant.earnings || undefined,
              });
            } catch (error) {
              console.error(`Failed to create feed post for athlete ${participant.athlete.id}:`, error);
              // Don't fail the request if individual post creation fails
            }
          })
        );
      } catch (error) {
        console.error('Failed to create notifications/feed posts for assigned athletes:', error);
        // Don't fail the request if notification/feed post creation fails
      }
    }

    res.json(campaign);
  } catch (error) {
    console.error('Assign athletes to campaign error:', error);
    res.status(500).json({ error: 'Failed to assign athletes to campaign' });
  }
}

export async function closeCampaign(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    // Get campaign with all related data
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: true,
        participants: {
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get all todos for this campaign with verification data
    const todos = await prisma.todo.findMany({
      where: {
        campaignId: id,
        verifiedAt: { not: null },
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Build verification content
    const verificationContent = todos.map(todo => ({
      athleteName: todo.athlete.name,
      verificationUrl: todo.verificationUrl || undefined,
      verificationNotes: todo.verificationNotes || undefined,
    }));

    // Build participants with earnings
    const participants = campaign.participants.map(p => ({
      athleteName: p.athlete.name,
      earnings: p.earnings || undefined,
    }));

    // Update campaign status to COMPLETED
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        organization: true,
        participants: {
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Create recap feed posts for each participating athlete
    try {
      // Create a general recap post (no athleteId)
      await createCampaignRecapPost({
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        organizationName: campaign.organization.name,
        organizationId: campaign.organizationId,
        organizationLogoUrl: campaign.organization.logoUrl || undefined,
        verificationContent,
        totalEarnings: campaign.totalEarnings || undefined,
        participants,
      });

      // Create individual recap posts for each athlete so they appear in their Content tab
      await Promise.all(
        campaign.participants.map(async (participant) => {
          try {
            const athleteVerification = verificationContent.find(
              v => v.athleteName === participant.athlete.name
            );
            
            const earningsText = participant.earnings 
              ? ` earning $${participant.earnings.toLocaleString()}` 
              : '';
            
            await prisma.feedPost.create({
              data: {
                type: 'CAMPAIGN',
                headline: `✅ Campaign Complete: ${campaign.title}`,
                body: `Congratulations to ${participant.athlete.name} on completing the "${campaign.title}" campaign with ${campaign.organization.name}!${earningsText ? earningsText : ''}${athleteVerification?.verificationUrl ? `\n\nVerification: ${athleteVerification.verificationUrl}` : ''}${athleteVerification?.verificationNotes ? `\n\nNotes: ${athleteVerification.verificationNotes}` : ''}`,
                tags: ['Campaign', 'Completed', campaign.organization.name, participant.athlete.name],
                authorName: campaign.organization.name,
                authorRole: 'Partner Brand',
                authorAvatarUrl: campaign.organization.logoUrl || 'https://placehold.co/64x64',
                authorOrg: campaign.organization.name,
                brand: campaign.organization.name,
                brandLogoUrl: campaign.organization.logoUrl || 'https://placehold.co/56x56',
                objective: `Campaign completion recap for ${participant.athlete.name}`,
                campaignStatus: 'wrapped',
                campaignId: campaign.id,
                organizationId: campaign.organizationId,
                athleteId: participant.athlete.id,
                isOpen: false,
              },
            });
          } catch (error) {
            console.error(`Failed to create recap post for athlete ${participant.athlete.id}:`, error);
            // Don't fail the request if individual post creation fails
          }
        })
      );
    } catch (error) {
      console.error('Failed to create recap posts:', error);
      // Don't fail the request if recap post creation fails
    }

    res.json(updatedCampaign);
  } catch (error) {
    console.error('Close campaign error:', error);
    res.status(500).json({ error: 'Failed to close campaign' });
  }
}

export async function acceptCampaignApplication(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { campaignId, participantId } = req.params;

    // Get participant and campaign
    const participant = await prisma.campaignParticipant.findUnique({
      where: { id: participantId },
      include: {
        campaign: {
          include: {
            organization: true,
          },
        },
        athlete: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (participant.campaignId !== campaignId) {
      return res.status(400).json({ error: 'Application does not belong to this campaign' });
    }

    if (participant.status !== 'APPLIED') {
      return res.status(400).json({ error: 'Application is not in APPLIED status' });
    }

    // Calculate earnings if campaign has totalEarnings
    let earnings = participant.earnings;
    if (participant.campaign.totalEarnings && !earnings) {
      // Count current accepted/invited participants
      const acceptedCount = await prisma.campaignParticipant.count({
        where: {
          campaignId,
          status: { in: ['ACCEPTED', 'INVITED'] },
        },
      });
      if (participant.campaign.earningsSplitMethod === 'EQUAL') {
        earnings = participant.campaign.totalEarnings / (acceptedCount + 1);
      }
    }

    // Update participant status to ACCEPTED
    const updatedParticipant = await prisma.campaignParticipant.update({
      where: { id: participantId },
      data: {
        status: 'ACCEPTED',
        earnings,
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        campaign: {
          include: {
            organization: true,
          },
        },
      },
    });

    // Send notification to athlete
    try {
      const athleteUser = await prisma.user.findFirst({
        where: {
          athlete: {
            id: participant.athleteId,
          },
        },
        select: { id: true },
      });

      if (athleteUser) {
        await createNotification({
          userId: athleteUser.id,
          type: 'CAMPAIGN_ASSIGNED',
          title: `Application Accepted: ${participant.campaign.title}`,
          message: `Congratulations! Your application to the "${participant.campaign.title}" campaign with ${participant.campaign.organization.name} has been accepted. Check your campaigns for details.`,
          linkUrl: `/athletes/${participant.athleteId}`,
          campaignId: participant.campaignId,
        });
      }

      // Create congratulatory feed post
      const campaignTypeLabels: Record<string, string> = {
        SOCIAL_MEDIA_POST: 'Social Media Post',
        COMMERCIAL_VIDEO: 'Commercial Video',
        IN_PERSON_APPEARANCE: 'In-Person Appearance',
        PRODUCT_ENDORSEMENT: 'Product Endorsement',
        AUTOGRAPH_SIGNING: 'Autograph Signing',
        SPEAKING_ENGAGEMENT: 'Speaking Engagement',
        PHOTO_SHOOT: 'Photo Shoot',
        PARTNERSHIP: 'Partnership',
      };

      await createAthleteCampaignPost({
        athleteId: participant.athlete.id,
        athleteName: participant.athlete.name,
        athleteAvatarUrl: participant.athlete.avatarUrl || undefined,
        campaignId: participant.campaignId,
        campaignTitle: participant.campaign.title,
        organizationName: participant.campaign.organization.name,
        organizationId: participant.campaign.organizationId,
        organizationLogoUrl: participant.campaign.organization.logoUrl || undefined,
        campaignType: campaignTypeLabels[participant.campaign.type] || participant.campaign.type,
        earnings: updatedParticipant.earnings || undefined,
      });
    } catch (error) {
      console.error('Failed to create notification/feed post for accepted application:', error);
      // Don't fail the request if notification creation fails
    }

    res.json(updatedParticipant);
  } catch (error) {
    console.error('Accept campaign application error:', error);
    res.status(500).json({ error: 'Failed to accept application' });
  }
}

export async function denyCampaignApplication(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { campaignId, participantId } = req.params;

    // Get participant and campaign
    const participant = await prisma.campaignParticipant.findUnique({
      where: { id: participantId },
      include: {
        campaign: {
          include: {
            organization: true,
          },
        },
        athlete: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (participant.campaignId !== campaignId) {
      return res.status(400).json({ error: 'Application does not belong to this campaign' });
    }

    if (participant.status !== 'APPLIED') {
      return res.status(400).json({ error: 'Application is not in APPLIED status' });
    }

    // Update participant status to DECLINED
    const updatedParticipant = await prisma.campaignParticipant.update({
      where: { id: participantId },
      data: {
        status: 'DECLINED',
      },
    });

    // Send notification to athlete
    try {
      const athleteUser = await prisma.user.findFirst({
        where: {
          athlete: {
            id: participant.athleteId,
          },
        },
        select: { id: true },
      });

      if (athleteUser) {
        await createNotification({
          userId: athleteUser.id,
          type: 'CAMPAIGN_ASSIGNED',
          title: `Application Update: ${participant.campaign.title}`,
          message: `Thank you for your interest in the "${participant.campaign.title}" campaign with ${participant.campaign.organization.name}. While we're unable to move forward with your application at this time, we appreciate your interest and encourage you to apply for future opportunities.`,
          linkUrl: `/campaigns`,
          campaignId: participant.campaignId,
        });
      }
    } catch (error) {
      console.error('Failed to create notification for denied application:', error);
      // Don't fail the request if notification creation fails
    }

    res.json(updatedParticipant);
  } catch (error) {
    console.error('Deny campaign application error:', error);
    res.status(500).json({ error: 'Failed to deny application' });
  }
}

export async function deleteCampaign(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    await prisma.campaign.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
}

// ===== Todo Management =====

export async function getAllTodos(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const todos = await prisma.todo.findMany({
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
}

export async function createTodo(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, description, athleteId, dueDate, priority, campaignId, assignedBy, verificationType } = req.body as {
      title?: string;
      description?: string;
      athleteId?: string;
      dueDate?: string;
      priority?: 'low' | 'medium' | 'high';
      campaignId?: string;
      assignedBy?: string;
      verificationType?: 'SOCIAL_POST' | 'IN_PERSON_EVENT' | 'COMMERCIAL_VIDEO' | 'OTHER';
    };

    if (!title || !description || !athleteId || !dueDate) {
      return res.status(400).json({ error: 'Title, description, athleteId, and dueDate are required' });
    }

    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid dueDate format' });
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        athleteId,
        dueDate: dueDateObj,
        priority: priority || 'medium',
        campaignId: campaignId || null,
        assignedBy: assignedBy || 'Admin',
        verificationType: verificationType || null,
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
}

export async function updateTodo(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { title, description, dueDate, status, priority } = req.body as {
      title?: string;
      description?: string;
      dueDate?: string;
      status?: 'pending' | 'in_progress' | 'completed';
      priority?: 'low' | 'medium' | 'high';
    };

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({ error: 'Invalid dueDate format' });
      }
      updateData.dueDate = dueDateObj;
    }
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const todo = await prisma.todo.update({
      where: { id },
      data: updateData,
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
}

export async function deleteTodo(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    await prisma.todo.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
}

// ===== Existing Functions =====

export async function updateAthleteBrandPositioning(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { athleteId } = req.params as { athleteId?: string };
    const { brandFitSummary } = req.body as { brandFitSummary?: string };

    if (!athleteId) {
      return res.status(400).json({ error: 'athleteId is required' });
    }

    const athlete = await prisma.athleteProfile.update({
      where: { id: athleteId },
      data: {
        brandFitSummary: brandFitSummary || null,
      },
      include: {
        socialProfiles: true,
        interests: true,
      },
    });

    res.json(athlete);
  } catch (error) {
    console.error('Update brand positioning error:', error);
    res.status(500).json({ error: 'Failed to update brand positioning' });
  }
}

export async function updateAthleteScenarioIdeas(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { athleteId } = req.params as { athleteId?: string };
    const { scenarioIdeas } = req.body as {
      scenarioIdeas: Array<{
        id?: string;
        title: string;
        goal: string;
        description: string;
        idealBrands: string;
      }>;
    };

    if (!athleteId) {
      return res.status(400).json({ error: 'athleteId is required' });
    }

    if (!Array.isArray(scenarioIdeas)) {
      return res.status(400).json({ error: 'scenarioIdeas must be an array' });
    }

    // Delete existing scenario ideas
    await prisma.scenarioIdea.deleteMany({
      where: { athleteId },
    });

    // Create new scenario ideas
    const createdIdeas = await Promise.all(
      scenarioIdeas.map((idea) =>
        prisma.scenarioIdea.create({
          data: {
            athleteId,
            title: idea.title,
            goal: idea.goal,
            description: idea.description,
            idealBrands: idea.idealBrands,
          },
        })
      )
    );

    res.json({ scenarioIdeas: createdIdeas });
  } catch (error) {
    console.error('Update scenario ideas error:', error);
    res.status(500).json({ error: 'Failed to update scenario ideas' });
  }
}

