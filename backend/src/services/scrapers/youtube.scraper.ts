import { BaseScraper, ScrapedMetrics } from "./base.scraper";

export class YouTubeScraper extends BaseScraper {
  async scrape(handle: string): Promise<ScrapedMetrics> {
    const page = await this.createPage();
    try {
      // Remove @ if present and handle different YouTube URL formats
      const cleanHandle = handle
        .replace(/^@/, "")
        .replace(/^youtube\.com\//, "");
      const url = `https://www.youtube.com/@${cleanHandle}`;

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: this.config.timeout,
      });

      // Wait for page to load
      await this.delay(3000);

      let followers = 0;
      let avgViews = 0;

      // Try to extract subscriber count
      const subscriberSelectors = [
        "#subscriber-count",
        'yt-formatted-string[id="subscriber-count"]',
        'span:contains("subscribers")',
      ];

      for (const selector of subscriberSelectors) {
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
        const videoElements = await page.$$('a[id="video-title"]');
        if (videoElements.length > 0) {
          const viewCounts: number[] = [];
          // Sample up to 10 recent videos
          for (let i = 0; i < Math.min(10, videoElements.length); i++) {
            try {
              // Navigate to video page to get view count (or try to get from thumbnail)
              const videoUrl = await page.evaluate(
                (el: Element) => el.getAttribute("href"),
                videoElements[i]
              );
              if (videoUrl) {
                const videoPage = await this.createPage();
                try {
                  await videoPage.goto(`https://www.youtube.com${videoUrl}`, {
                    waitUntil: "networkidle2",
                    timeout: 15000,
                  });
                  await this.delay(2000);
                  const viewElement = await videoPage.$(
                    'span[class*="view-count"], yt-formatted-string[class*="view-count"]'
                  );
                  if (viewElement) {
                    const viewText = await videoPage.evaluate(
                      (el: Element) => el.textContent,
                      viewElement
                    );
                    if (viewText) {
                      viewCounts.push(this.parseNumber(viewText));
                    }
                  }
                } catch (e) {
                  // Skip this video
                } finally {
                  await videoPage.close();
                }
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
        // Ignore errors - fallback to estimate
      }

      // Estimate engagement rate for YouTube (typically 2-5% for views/subscribers)
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
        error: error.message || "Failed to scrape YouTube",
      };
    } finally {
      await page.close();
    }
  }
}
