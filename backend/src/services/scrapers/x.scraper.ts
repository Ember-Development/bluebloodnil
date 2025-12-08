import { BaseScraper, ScrapedMetrics } from "./base.scraper";

export class XScraper extends BaseScraper {
  async scrape(handle: string): Promise<ScrapedMetrics> {
    const page = await this.createPage();
    try {
      // Remove @ if present
      const cleanHandle = handle.replace(/^@/, "");
      const url = `https://x.com/${cleanHandle}`;

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: this.config.timeout,
      });

      // Wait for page to load (X/Twitter can be slow)
      await this.delay(4000);

      let followers = 0;

      // Try to extract followers count
      const followerSelectors = [
        'a[href*="/followers"] span span',
        '[data-testid="UserFollowersCount"]',
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

      // X/Twitter engagement is harder to calculate without API
      // We can estimate based on typical engagement rates (0.5-2% for most accounts)
      const avgEngagementRate = followers > 0 ? 1.0 : undefined; // Default estimate

      return {
        followers,
        avgEngagementRate,
      };
    } catch (error: any) {
      return {
        followers: 0,
        error: error.message || "Failed to scrape X/Twitter",
      };
    } finally {
      await page.close();
    }
  }
}
