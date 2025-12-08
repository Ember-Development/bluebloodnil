import { prisma } from "../config/prisma";
import { InstagramScraper } from "./scrapers/instagram.scraper";
import { TikTokScraper } from "./scrapers/tiktok.scraper";
import { YouTubeScraper } from "./scrapers/youtube.scraper";
import { XScraper } from "./scrapers/x.scraper";
import { BaseScraper, ScrapedMetrics } from "./scrapers/base.scraper";

export interface ScrapeResult {
  success: boolean;
  metrics?: ScrapedMetrics;
  error?: string;
}

export class SocialScraperService {
  private scrapers: Map<string, BaseScraper> = new Map();
  private rateLimitDelay: number;

  constructor() {
    this.rateLimitDelay = parseInt(
      process.env.SCRAPING_RATE_LIMIT_DELAY || "5000"
    );
    this.initializeScrapers();
  }

  private initializeScrapers(): void {
    this.scrapers.set("instagram", new InstagramScraper());
    this.scrapers.set("tiktok", new TikTokScraper());
    this.scrapers.set("youtube", new YouTubeScraper());
    this.scrapers.set("x", new XScraper());
  }

  private getScraper(platform: string): BaseScraper | null {
    return this.scrapers.get(platform.toLowerCase()) || null;
  }

  async scrapeProfile(
    profileId: string,
    platform: string,
    handle: string
  ): Promise<ScrapeResult> {
    if (process.env.SCRAPING_ENABLED === "false") {
      return {
        success: false,
        error: "Scraping is disabled",
      };
    }

    const scraper = this.getScraper(platform);
    if (!scraper) {
      return {
        success: false,
        error: `No scraper available for platform: ${platform}`,
      };
    }

    try {
      // Update status to pending
      await prisma.athleteSocialProfile.update({
        where: { id: profileId },
        data: {
          scrapingStatus: "pending",
          scrapingError: null,
        },
      });

      // Perform scraping
      const metrics = await scraper.scrape(handle);

      if (metrics.error) {
        // Update with error
        await prisma.athleteSocialProfile.update({
          where: { id: profileId },
          data: {
            scrapingStatus: "failed",
            scrapingError: metrics.error,
          },
        });

        return {
          success: false,
          error: metrics.error,
        };
      }

      // Update profile with scraped metrics
      await prisma.athleteSocialProfile.update({
        where: { id: profileId },
        data: {
          followers: metrics.followers,
          avgEngagementRate: metrics.avgEngagementRate,
          avgViews: metrics.avgViews,
          lastScrapedAt: new Date(),
          scrapingStatus: "success",
          scrapingError: null,
        },
      });

      // Update total reach for athlete
      await this.updateAthleteTotalReach(profileId);

      return {
        success: true,
        metrics,
      };
    } catch (error: any) {
      // Update with error
      await prisma.athleteSocialProfile.update({
        where: { id: profileId },
        data: {
          scrapingStatus: "failed",
          scrapingError: error.message || "Unknown error",
        },
      });

      return {
        success: false,
        error: error.message || "Scraping failed",
      };
    }
  }

  async scrapeAllProfilesForAthlete(athleteId: string): Promise<void> {
    const profiles = await prisma.athleteSocialProfile.findMany({
      where: { athleteId },
    });

    for (const profile of profiles) {
      await this.scrapeProfile(profile.id, profile.platform, profile.handle);
      // Rate limiting delay between profiles
      await this.delay(this.rateLimitDelay);
    }
  }

  async scrapeAllProfiles(): Promise<{ success: number; failed: number }> {
    const profiles = await prisma.athleteSocialProfile.findMany({
      where: {
        handle: { not: "" },
      },
    });

    let success = 0;
    let failed = 0;

    for (const profile of profiles) {
      const result = await this.scrapeProfile(
        profile.id,
        profile.platform,
        profile.handle
      );
      if (result.success) {
        success++;
      } else {
        failed++;
      }
      // Rate limiting delay
      await this.delay(this.rateLimitDelay);
    }

    return { success, failed };
  }

  private async updateAthleteTotalReach(profileId: string): Promise<void> {
    const profile = await prisma.athleteSocialProfile.findUnique({
      where: { id: profileId },
      select: { athleteId: true },
    });

    if (!profile) return;

    // Calculate total reach across all platforms for this athlete
    const allProfiles = await prisma.athleteSocialProfile.findMany({
      where: { athleteId: profile.athleteId },
    });

    const totalReach = allProfiles.reduce(
      (sum, p) => sum + (p.followers || 0),
      0
    );

    // Update each profile with total reach (or create a separate field in AthleteProfile)
    // For now, we'll update the athlete profile if needed
    await prisma.athleteProfile.update({
      where: { id: profile.athleteId },
      data: {
        // Note: We might want to add a totalReach field to AthleteProfile
        // For now, this is handled in the frontend calculation
      },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async cleanup(): Promise<void> {
    // Close all browser instances
    for (const scraper of this.scrapers.values()) {
      await scraper.close();
    }
  }
}

// Singleton instance
export const socialScraperService = new SocialScraperService();
