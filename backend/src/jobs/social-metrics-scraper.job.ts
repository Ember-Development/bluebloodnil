import cron from "node-cron";
import { socialScraperService } from "../services/social-scraper.service";
import { prisma } from "../config/prisma";

export class SocialMetricsScraperJob {
  private cronJob: cron.ScheduledTask | null = null;

  start(): void {
    // Run every Sunday at 2 AM
    // Cron format: minute hour day month dayOfWeek
    this.cronJob = cron.schedule("0 2 * * 0", async () => {
      console.log("[Social Metrics Scraper] Starting weekly scraping job...");
      try {
        const result = await socialScraperService.scrapeAllProfiles();
        console.log(
          `[Social Metrics Scraper] Completed: ${result.success} successful, ${result.failed} failed`
        );
      } catch (error) {
        console.error("[Social Metrics Scraper] Error:", error);
      }
    });

    console.log(
      "[Social Metrics Scraper] Weekly job scheduled (Sundays at 2 AM)"
    );
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log("[Social Metrics Scraper] Job stopped");
    }
  }

  async runNow(): Promise<{ success: number; failed: number }> {
    console.log("[Social Metrics Scraper] Running manual scrape...");
    return await socialScraperService.scrapeAllProfiles();
  }
}

export const socialMetricsScraperJob = new SocialMetricsScraperJob();
