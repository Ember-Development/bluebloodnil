import { BaseScraper, ScrapedMetrics } from "./base.scraper";

export class TikTokScraper extends BaseScraper {
  async scrape(handle: string): Promise<ScrapedMetrics> {
    const page = await this.createPage();
    try {
      // Remove @ if present
      const cleanHandle = handle.replace(/^@/, "");
      const url = `https://www.tiktok.com/@${cleanHandle}`;

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: this.config.timeout,
      });

      // Wait for page to load
      await this.delay(3000);

      let followers = 0;
      let avgViews = 0;

      // Try to extract followers count
      const followerSelectors = [
        '[data-e2e="followers-count"]',
        'strong[title*="Followers"]',
        'span:contains("Followers")',
      ];

      for (const selector of followerSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const text = await page.evaluate(
              (el: Element) => el.textContent,
              element
            );
            followers = this.parseNumber(text);
            if (followers > 0) break;
          }
        } catch (e) {
          continue;
        }
      }

      // Try to get average views from recent videos
      try {
        const videoElements = await page.$$('[data-e2e="user-post-item"]');
        if (videoElements.length > 0) {
          // Sample a few videos to get average views
          const viewCounts: number[] = [];
          for (let i = 0; i < Math.min(5, videoElements.length); i++) {
            try {
              const viewText = await page.evaluate(
                (el: Element) =>
                  el.querySelector('[data-e2e="video-views"]')?.textContent,
                videoElements[i]
              );
              if (viewText) {
                viewCounts.push(this.parseNumber(viewText));
              }
            } catch (e) {
              // Skip this video
            }
          }
          if (viewCounts.length > 0) {
            avgViews = Math.round(
              viewCounts.reduce((sum, v) => sum + v, 0) / viewCounts.length
            );
          }
        }
      } catch (e) {
        // Ignore errors
      }

      // Estimate engagement rate (TikTok typically has 3-9% engagement)
      const avgEngagementRate =
        avgViews > 0 && followers > 0
          ? (avgViews / followers) * 100
          : undefined;

      return {
        followers,
        avgViews: avgViews > 0 ? avgViews : undefined,
        avgEngagementRate:
          avgEngagementRate && avgEngagementRate < 100
            ? avgEngagementRate
            : undefined,
      };
    } catch (error: any) {
      return {
        followers: 0,
        error: error.message || "Failed to scrape TikTok",
      };
    } finally {
      await page.close();
    }
  }
}
