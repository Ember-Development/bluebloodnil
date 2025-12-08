import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return "just now";
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
      type?: "athlete_update" | "campaign" | "org_announcement" | "commitment";
    };

    // Page size with sane defaults and an upper bound
    const pageSize = Math.min(
      Math.max(parseInt(limit || "0", 10) || 20, 1),
      50
    );

    const typeToDbType: Record<
      string,
      "ATHLETE_UPDATE" | "CAMPAIGN" | "ORG_ANNOUNCEMENT" | "COMMITMENT"
    > = {
      athlete_update: "ATHLETE_UPDATE",
      campaign: "CAMPAIGN",
      org_announcement: "ORG_ANNOUNCEMENT",
      commitment: "COMMITMENT",
    };

    const where: Prisma.FeedPostWhereInput = {};

    if (type && typeToDbType[type]) {
      where.type = typeToDbType[type];
    }

    const queryOptions: Parameters<typeof prisma.feedPost.findMany>[0] = {
      where,
      orderBy: { createdAt: "desc" },
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
      const typeMap: Record<
        string,
        "athlete_update" | "campaign" | "org_announcement" | "commitment"
      > = {
        ATHLETE_UPDATE: "athlete_update",
        CAMPAIGN: "campaign",
        ORG_ANNOUNCEMENT: "org_announcement",
        COMMITMENT: "commitment",
      };

      const base = {
        id: post.id,
        type: typeMap[post.type] || "org_announcement",
        createdAt: post.createdAt.toISOString(),
        timeAgo: formatTimeAgo(post.createdAt),
        author: {
          id: post.authorId || "system",
          name: post.authorName,
          role: post.authorRole,
          avatarUrl: post.authorAvatarUrl || "https://placehold.co/64x64",
          org: post.authorOrg || undefined,
        },
        headline: post.headline,
        body: post.body,
        tags: post.tags,
      };

      if (post.type === "CAMPAIGN") {
        return {
          ...base,
          type: "campaign" as const,
          brand: post.brand || "",
          brandLogoUrl: post.brandLogoUrl || "https://placehold.co/56x56",
          objective: post.objective || "",
          status: (post.campaignStatus || "planning") as
            | "planning"
            | "live"
            | "wrapped",
          campaignId: post.campaignId || undefined,
          isOpen: post.isOpen || undefined,
        };
      }

      if (post.type === "ATHLETE_UPDATE") {
        return {
          ...base,
          type: "athlete_update" as const,
          statLine: post.statLine || undefined,
          mediaUrl: post.mediaUrl || undefined,
        };
      }

      if (post.type === "COMMITMENT") {
        return {
          ...base,
          type: "commitment" as const,
          program: post.program || "",
          level: (post.level || "D1") as
            | "D1"
            | "D2"
            | "NAIA"
            | "JUCO"
            | "HS"
            | "Club",
        };
      }

      return {
        ...base,
        type: "org_announcement" as const,
      };
    });

    const nextCursor = hasMore ? pageItems[pageItems.length - 1].id : null;

    res.json({
      items: transformedItems,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Get feed posts error:", error);
    res.status(500).json({ error: "Failed to fetch feed posts" });
  }
}

export async function getTrendingAthletes(req: AuthRequest, res: Response) {
  try {
    // Get athletes with recent feed activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find athletes with recent feed posts
    const recentFeedPosts = await prisma.feedPost.findMany({
      where: {
        athleteId: { not: null },
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        athleteId: true,
        headline: true,
        body: true,
        statLine: true,
        createdAt: true,
        type: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by athlete and count activity
    const athleteActivityMap = new Map<
      string,
      {
        athleteId: string;
        mostRecentPost: (typeof recentFeedPosts)[0];
        postCount: number;
      }
    >();

    for (const post of recentFeedPosts) {
      if (!post.athleteId) continue;

      const existing = athleteActivityMap.get(post.athleteId);
      if (!existing || post.createdAt > existing.mostRecentPost.createdAt) {
        athleteActivityMap.set(post.athleteId, {
          athleteId: post.athleteId,
          mostRecentPost: post,
          postCount: (existing?.postCount || 0) + 1,
        });
      } else if (existing) {
        existing.postCount++;
      }
    }

    // Get unique athlete IDs, sorted by activity (most posts first, then most recent)
    let athleteIds = Array.from(athleteActivityMap.entries())
      .sort((a, b) => {
        // First sort by post count (more posts = more trending)
        if (b[1].postCount !== a[1].postCount) {
          return b[1].postCount - a[1].postCount;
        }
        // Then by most recent post
        return (
          b[1].mostRecentPost.createdAt.getTime() -
          a[1].mostRecentPost.createdAt.getTime()
        );
      })
      .slice(0, 4) // Get top 4
      .map(([athleteId]) => athleteId);

    // If we don't have 4 athletes with recent activity, fill with most active athletes overall
    if (athleteIds.length < 4) {
      // Get athletes with most recent campaigns or content
      const additionalAthletes = await prisma.athleteProfile.findMany({
        where: {
          id: { notIn: athleteIds },
        },
        include: {
          participants: {
            include: {
              campaign: {
                select: {
                  createdAt: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 4 - athleteIds.length,
      });

      athleteIds = [
        ...athleteIds,
        ...additionalAthletes.map((a) => a.id).slice(0, 4 - athleteIds.length),
      ];
    }

    // Fetch athlete details
    const athletes = await prisma.athleteProfile.findMany({
      where: {
        id: { in: athleteIds },
      },
      select: {
        id: true,
        name: true,
        position1: true,
        position2: true,
        position: true,
        teamName: true,
        avatarUrl: true,
        nilScore: true,
      },
    });

    // Get recent activity for each athlete
    const trendingAthletes = await Promise.all(
      athletes.map(async (athlete) => {
        // Get most recent feed post for this athlete
        const mostRecentPost = await prisma.feedPost.findFirst({
          where: {
            athleteId: athlete.id,
          },
          orderBy: { createdAt: "desc" },
          select: {
            headline: true,
            body: true,
            statLine: true,
            type: true,
            createdAt: true,
          },
        });

        // Format recent activity text
        let recentActivity = "Active on platform";
        if (mostRecentPost) {
          if (
            mostRecentPost.type === "ATHLETE_UPDATE" &&
            mostRecentPost.statLine
          ) {
            recentActivity = mostRecentPost.statLine;
          } else if (mostRecentPost.type === "CAMPAIGN") {
            // Extract campaign info from headline
            const headline = mostRecentPost.headline;
            if (headline.includes("selected for")) {
              recentActivity = headline
                .replace("🎉 ", "")
                .replace(" selected for", "");
            } else if (headline.includes("Campaign Complete")) {
              recentActivity = "Completed campaign";
            } else {
              recentActivity = headline;
            }
          } else if (mostRecentPost.headline) {
            recentActivity =
              mostRecentPost.headline.length > 50
                ? mostRecentPost.headline.substring(0, 50) + "..."
                : mostRecentPost.headline;
          }
        }

        // Build position string
        const position =
          athlete.position ||
          [athlete.position1, athlete.position2].filter(Boolean).join(" / ") ||
          "Athlete";

        return {
          id: athlete.id,
          name: athlete.name,
          position,
          team: athlete.teamName || "No Team",
          avatarUrl:
            athlete.avatarUrl ||
            "https://via.placeholder.com/400x400?text=No+Photo",
          recentActivity,
          nilScore: athlete.nilScore || undefined,
          profileUrl: `/athletes/${athlete.id}`,
        };
      })
    );

    // Ensure we return exactly 4 (or fewer if not enough athletes exist)
    res.json(trendingAthletes.slice(0, 4));
  } catch (error) {
    console.error("Get trending athletes error:", error);
    res.status(500).json({ error: "Failed to fetch trending athletes" });
  }
}

export async function getFeaturedCampaign(req: AuthRequest, res: Response) {
  try {
    // Get the most recent completed campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        status: "COMPLETED",
      },
      orderBy: {
        updatedAt: "desc", // Most recently completed
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
          where: {
            status: "ACCEPTED",
          },
          include: {
            athlete: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 1, // Get first participant for athlete name
        },
      },
    });

    if (!campaign) {
      return res.json(null);
    }

    // Extract results metrics
    const results = campaign.results as any;
    const metrics: {
      impressions?: string;
      engagement?: string;
      conversions?: string;
    } = {};

    if (results?.metrics) {
      if (results.metrics.reach) {
        metrics.impressions = results.metrics.reach;
      } else if (results.metrics.views) {
        metrics.impressions = results.metrics.views;
      }
      if (results.metrics.engagement) {
        metrics.engagement = results.metrics.engagement;
      }
      if (results.metrics.sales) {
        metrics.conversions = results.metrics.sales;
      }
    }

    // Get athlete name (use first participant or organization name as fallback)
    const athleteName =
      campaign.participants[0]?.athlete?.name || campaign.organization.name;

    res.json({
      id: campaign.id,
      brand: campaign.organization.name,
      brandLogoUrl:
        campaign.organization.logoUrl || "https://placehold.co/56x56",
      title: campaign.title,
      objective: campaign.description || campaign.title,
      status: "wrapped" as const,
      metrics,
      athleteName,
    });
  } catch (error) {
    console.error("Get featured campaign error:", error);
    res.status(500).json({ error: "Failed to fetch featured campaign" });
  }
}
