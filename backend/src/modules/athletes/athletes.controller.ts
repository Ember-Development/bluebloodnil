import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export async function getPublicOrganizations(req: Request, res: Response) {
  try {
    console.log('getPublicOrganizations called');
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: { campaigns: true },
        },
        campaigns: {
          select: {
            participants: {
              select: {
                athleteId: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${organizations.length} organizations`);

    const organizationsWithAthletes = organizations.map((org) => {
      // Count unique athletes across all campaigns for this organization
      const uniqueAthletes = new Set(
        org.campaigns.flatMap(campaign => 
          campaign.participants.map(p => p.athleteId)
        )
      );

      return {
        id: org.id,
        name: org.name,
        logoUrl: org.logoUrl,
        tier: org.tier,
        campaignsCount: org._count.campaigns,
        athletesWorkedWith: uniqueAthletes.size,
        createdAt: org.createdAt,
      };
    });

    console.log(`Returning ${organizationsWithAthletes.length} organizations`);
    res.json(organizationsWithAthletes);
  } catch (error) {
    console.error('Get public organizations error:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
}

export async function getMyProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: req.user.athleteId },
      include: {
        socialProfiles: true,
        interests: true,
        parentContacts: true,
      },
    });

    if (!athlete) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    res.json(athlete);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export async function getAllAthletes(req: Request, res: Response) {
  try {
    // Get all athletes with completed profiles (public view)
    // For admin, we also include brandFitSummary and scenarioIdeas
    const athletes = await prisma.athleteProfile.findMany({
      where: {
        profileComplete: true,
      },
      include: {
        socialProfiles: true,
        interests: true,
        scenarioIdeas: true,
        participants: {
          include: {
            campaign: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(athletes);
  } catch (error) {
    console.error('Get all athletes error:', error);
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
}

export async function getAthleteById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const athlete = await prisma.athleteProfile.findUnique({
      where: { id },
      include: {
        socialProfiles: true,
        interests: true,
        parentContacts: true,
        scenarioIdeas: true,
        contents: true,
        milestones: {
          orderBy: {
            date: 'desc', // Most recent first
          },
        },
        participants: {
          select: {
            id: true,
            earnings: true,
            status: true,
            campaign: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true,
                createdAt: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    res.json(athlete);
  } catch (error) {
    console.error('Get athlete by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch athlete' });
  }
}

export async function updateMyProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const {
      location,
      bio,
      sport,
      primaryPosition,
      avatarUrl,
      videoUrl,
      position,
      school,
    } = req.body;

    const athlete = await prisma.athleteProfile.update({
      where: { id: req.user.athleteId },
      data: {
        location,
        bio,
        sport,
        primaryPosition,
        avatarUrl,
        videoUrl,
        position: position || primaryPosition,
        school,
      },
      include: {
        socialProfiles: true,
        interests: true,
      },
    });

    res.json(athlete);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function updateSocialProfiles(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const athleteId = req.user.athleteId;
    const { socialProfiles } = req.body; // Array of social profile objects

    if (!Array.isArray(socialProfiles)) {
      return res.status(400).json({ error: 'socialProfiles must be an array' });
    }

    // Delete existing social profiles
    await prisma.athleteSocialProfile.deleteMany({
      where: { athleteId },
    });

    // Create new social profiles
    const createdProfiles = await Promise.all(
      socialProfiles.map((profile) =>
        prisma.athleteSocialProfile.create({
          data: {
            athleteId,
            platform: profile.platform,
            handle: profile.handle,
            followers: profile.followers || 0,
            avgEngagementRate: profile.avgEngagementRate,
            avgViews: profile.avgViews || 0,
            postingCadence: profile.postingCadence,
          },
        })
      )
    );

    res.json({ socialProfiles: createdProfiles });
  } catch (error) {
    console.error('Update social profiles error:', error);
    res.status(500).json({ error: 'Failed to update social profiles' });
  }
}

export async function updateInterests(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const athleteId = req.user.athleteId;
    const { interests } = req.body; // Array of interest objects with label and color

    if (!Array.isArray(interests)) {
      return res.status(400).json({ error: 'interests must be an array' });
    }

    // Delete existing interests
    await prisma.athleteInterest.deleteMany({
      where: { athleteId },
    });

    // Create new interests
    const createdInterests = await Promise.all(
      interests.map((interest) =>
        prisma.athleteInterest.create({
          data: {
            athleteId,
            label: interest.label,
            color: interest.color,
          },
        })
      )
    );

    res.json({ interests: createdInterests });
  } catch (error) {
    console.error('Update interests error:', error);
    res.status(500).json({ error: 'Failed to update interests' });
  }
}

export async function completeOnboarding(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const athlete = await prisma.athleteProfile.update({
      where: { id: req.user.athleteId },
      data: {
        profileComplete: true,
      },
      include: {
        socialProfiles: true,
        interests: true,
      },
    });

    res.json({ success: true, athlete });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
}

export async function createMilestone(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const { title, date, description } = req.body as {
      title?: string;
      date?: string;
      description?: string;
    };

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    // Parse date string to DateTime
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const milestone = await prisma.milestone.create({
      data: {
        athleteId: req.user.athleteId,
        title,
        date: dateObj,
        description: description || null,
      },
    });

    res.json(milestone);
  } catch (error) {
    console.error('Create milestone error:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
}

export async function getMyTodos(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const todos = await prisma.todo.findMany({
      where: { athleteId: req.user.athleteId },
      orderBy: { dueDate: 'asc' },
    });

    res.json(todos);
  } catch (error) {
    console.error('Get my todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
}

export async function verifyTodo(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const { id } = req.params;
    const { verificationUrl, verificationNotes } = req.body as {
      verificationUrl?: string;
      verificationNotes?: string;
    };

    // Verify the todo belongs to this athlete
    const todo = await prisma.todo.findFirst({
      where: {
        id,
        athleteId: req.user.athleteId,
      },
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (!verificationUrl && !verificationNotes) {
      return res.status(400).json({ error: 'Verification URL or notes are required' });
    }

    // Update todo with verification
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        verificationUrl: verificationUrl || null,
        verificationNotes: verificationNotes || null,
        verifiedAt: new Date(),
        status: 'completed', // Auto-complete when verified
      },
    });

    res.json(updatedTodo);
  } catch (error) {
    console.error('Verify todo error:', error);
    res.status(500).json({ error: 'Failed to verify todo' });
  }
}

export async function getAvailableCampaigns(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    // Get campaigns that are open and active
    const campaigns = await prisma.campaign.findMany({
      where: {
        isOpen: true,
        status: 'ACTIVE',
        // Exclude campaigns the athlete is already part of
        participants: {
          none: {
            athleteId: req.user.athleteId,
          },
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        participants: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Get available campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch available campaigns' });
  }
}

export async function getAthleteFeedPosts(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const feedPosts = await prisma.feedPost.findMany({
      where: {
        athleteId: id,
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to most recent 50 posts
    });

    // Transform to match frontend FeedItem format
    const transformedItems = feedPosts.map((post) => {
      const typeMap: Record<string, 'athlete_update' | 'campaign' | 'org_announcement' | 'commitment'> = {
        ATHLETE_UPDATE: 'athlete_update',
        CAMPAIGN: 'campaign',
        ORG_ANNOUNCEMENT: 'org_announcement',
        COMMITMENT: 'commitment',
      };

      const now = new Date();
      const diffMs = now.getTime() - post.createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      let timeAgo = 'just now';
      if (diffMins >= 1 && diffMins < 60) timeAgo = `${diffMins}m ago`;
      else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
      else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
      else if (diffWeeks < 4) timeAgo = `${diffWeeks}w ago`;
      else if (diffMonths < 12) timeAgo = `${diffMonths}mo ago`;
      else timeAgo = `${Math.floor(diffDays / 365)}y ago`;

      const base = {
        id: post.id,
        type: typeMap[post.type] || 'org_announcement',
        createdAt: post.createdAt.toISOString(),
        timeAgo,
        author: {
          id: post.authorId || 'system',
          name: post.authorName,
          role: post.authorRole,
          avatarUrl: post.authorAvatarUrl || 'https://placehold.co/64x64',
          org: post.authorOrg || undefined,
        },
        headline: post.headline,
        body: post.body,
        tags: post.tags,
      };

      if (post.type === 'CAMPAIGN') {
        return {
          ...base,
          type: 'campaign' as const,
          brand: post.brand || '',
          brandLogoUrl: post.brandLogoUrl || 'https://placehold.co/56x56',
          objective: post.objective || '',
          status: (post.campaignStatus || 'planning') as 'planning' | 'live' | 'wrapped',
          campaignId: post.campaignId || undefined,
          isOpen: post.isOpen || undefined,
        };
      }

      if (post.type === 'ATHLETE_UPDATE') {
        return {
          ...base,
          type: 'athlete_update' as const,
          statLine: post.statLine || undefined,
          mediaUrl: post.mediaUrl || undefined,
        };
      }

      if (post.type === 'COMMITMENT') {
        return {
          ...base,
          type: 'commitment' as const,
          program: post.program || '',
          level: (post.level || 'D1') as 'D1' | 'D2' | 'NAIA' | 'JUCO' | 'HS' | 'Club',
        };
      }

      return {
        ...base,
        type: 'org_announcement' as const,
      };
    });

    res.json(transformedItems);
  } catch (error) {
    console.error('Get athlete feed posts error:', error);
    res.status(500).json({ error: 'Failed to fetch athlete feed posts' });
  }
}

export async function applyToCampaign(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.athleteId) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    const { id } = req.params;

    // Check if campaign exists and is open
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: true,
        participants: {
          where: {
            athleteId: req.user.athleteId,
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (!campaign.isOpen) {
      return res.status(400).json({ error: 'Campaign is not open for applications' });
    }

    if (campaign.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Campaign is not active' });
    }

    // Check if athlete already applied or is participating
    if (campaign.participants.length > 0) {
      return res.status(400).json({ error: 'You have already applied to or are participating in this campaign' });
    }

    // Create application
    const participant = await prisma.campaignParticipant.create({
      data: {
        campaignId: id,
        athleteId: req.user.athleteId,
        status: 'APPLIED',
        appliedAt: new Date(),
      },
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

    // Create notification for admin
    try {
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      if (adminUsers.length > 0) {
        await Promise.all(
          adminUsers.map(admin =>
            prisma.notification.create({
              data: {
                userId: admin.id,
                type: 'CAMPAIGN_ASSIGNED',
                title: `New Campaign Application: ${campaign.title}`,
                message: `${participant.athlete.name} has applied to the campaign "${campaign.title}" from ${campaign.organization.name}.`,
                linkUrl: `/admin`,
                campaignId: campaign.id,
              },
            })
          )
        );
      }
    } catch (error) {
      console.error('Failed to create notification for application:', error);
      // Don't fail the request if notification creation fails
    }

    res.json(participant);
  } catch (error) {
    console.error('Apply to campaign error:', error);
    res.status(500).json({ error: 'Failed to apply to campaign' });
  }
}
