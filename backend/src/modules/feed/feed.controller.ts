import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export async function getFeedPosts(req: AuthRequest, res: Response) {
  try {
    const { cursor, limit, type } = req.query as {
      cursor?: string;
      limit?: string;
      type?: 'athlete_update' | 'campaign' | 'org_announcement' | 'commitment';
    };

    // Page size with sane defaults and an upper bound
    const pageSize = Math.min(Math.max(parseInt(limit || '0', 10) || 20, 1), 50);

    const typeToDbType: Record<
      string,
      'ATHLETE_UPDATE' | 'CAMPAIGN' | 'ORG_ANNOUNCEMENT' | 'COMMITMENT'
    > = {
      athlete_update: 'ATHLETE_UPDATE',
      campaign: 'CAMPAIGN',
      org_announcement: 'ORG_ANNOUNCEMENT',
      commitment: 'COMMITMENT',
    };

    const where: Prisma.FeedPostWhereInput = {};

    if (type && typeToDbType[type]) {
      where.type = typeToDbType[type];
    }

    const queryOptions: Parameters<typeof prisma.feedPost.findMany>[0] = {
      where,
      orderBy: { createdAt: 'desc' },
      take: pageSize + 1, // Fetch one extra to determine if there's a next page
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1; // Skip the cursor item itself
    }

    const feedPosts = await prisma.feedPost.findMany(queryOptions);

    const hasMore = feedPosts.length > pageSize;
    const pageItems = hasMore ? feedPosts.slice(0, pageSize) : feedPosts;

    // Transform to match frontend FeedItem format
    const transformedItems = pageItems.map((post) => {
      const typeMap: Record<string, 'athlete_update' | 'campaign' | 'org_announcement' | 'commitment'> =
        {
          ATHLETE_UPDATE: 'athlete_update',
          CAMPAIGN: 'campaign',
          ORG_ANNOUNCEMENT: 'org_announcement',
          COMMITMENT: 'commitment',
        };

      const base = {
        id: post.id,
        type: typeMap[post.type] || 'org_announcement',
        createdAt: post.createdAt.toISOString(),
        timeAgo: formatTimeAgo(post.createdAt),
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

    const nextCursor = hasMore ? pageItems[pageItems.length - 1].id : null;

    res.json({
      items: transformedItems,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Get feed posts error:', error);
    res.status(500).json({ error: 'Failed to fetch feed posts' });
  }
}

