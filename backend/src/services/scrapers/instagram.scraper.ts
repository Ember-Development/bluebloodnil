import { BaseScraper, ScrapedMetrics } from "./base.scraper";

export class InstagramScraper extends BaseScraper {
  async scrape(handle: string): Promise<ScrapedMetrics> {
    const page = await this.createPage();
    try {
      const cleanHandle = handle.replace(/^@/, "");
      const url = `https://www.instagram.com/${cleanHandle}/`;

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: this.config.timeout,
      });

      // Wait longer for dynamic content
      await this.delay(5000);

      let followers = 0;
      let avgEngagementRate: number | undefined = undefined;

      // Try to get followers from meta tag (most reliable)
      try {
        const metaDescription = await page.$eval(
          'meta[property="og:description"]',
          (el: Element) => el.getAttribute("content")
        );
        if (metaDescription) {
          // Format: "123,456 Followers, 7,890 Following, 1,234 Posts"
          const followerMatch = metaDescription.match(/([\d,]+)\s+Followers/i);
          if (followerMatch) {
            followers = this.parseNumber(followerMatch[1]);
          }
        }
      } catch (e) {
        // Try alternative methods
      }

      // Alternative: Try to find followers in page text
      if (followers === 0) {
        try {
          const pageText = await page.evaluate(() => document.body.innerText);
          const followerMatches = pageText.match(/([\d,]+)\s+followers?/i);
          if (followerMatches) {
            followers = this.parseNumber(followerMatches[1]);
          }
        } catch (e) {
          // Ignore
        }
      }

      // Try multiple selectors to find posts
      let foundPosts = false;
      const postSelectors = [
        "article",
        'a[href*="/p/"]',
        'a[href*="/reel/"]',
        '[role="main"] a[href*="/p/"]',
        'div[style*="flex"] a[href*="/p/"]',
      ];

      for (const selector of postSelectors) {
        try {
          const posts = await page.$$(selector);
          if (posts.length > 0) {
            foundPosts = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // If we found posts, try to get engagement data
      if (foundPosts && followers > 0) {
        try {
          // Try to click on first post to get engagement data
          const firstPost = await page.$('a[href*="/p/"]');
          if (firstPost) {
            const postUrl = await page.evaluate(
              (el: Element) => el.getAttribute("href"),
              firstPost
            );

            if (postUrl) {
              const postPage = await this.createPage();
              try {
                await postPage.goto(`https://www.instagram.com${postUrl}`, {
                  waitUntil: "domcontentloaded",
                  timeout: 15000,
                });
                await this.delay(3000);

                // Try to extract likes
                const likesText = await postPage.evaluate(() => {
                  // Try multiple selectors for likes
                  const selectors = [
                    'span:contains("likes")',
                    "button span",
                    "a span",
                    '[aria-label*="like"]',
                  ];

                  for (const sel of selectors) {
                    const elements =
                      document.querySelectorAll("span, button, a");
                    for (const el of Array.from(elements)) {
                      const text = el.textContent || "";
                      if (
                        text.includes("likes") ||
                        text.includes("like") ||
                        /^[\d,]+$/.test(text.trim())
                      ) {
                        const numMatch = text.match(/([\d,]+)/);
                        if (
                          numMatch &&
                          parseInt(numMatch[1].replace(/,/g, "")) > 0
                        ) {
                          return numMatch[1];
                        }
                      }
                    }
                  }
                  return null;
                });

                if (likesText && followers > 0) {
                  const likes = this.parseNumber(likesText);
                  if (likes > 0) {
                    const rate = (likes / followers) * 100;
                    if (rate > 0 && rate < 100) {
                      avgEngagementRate = Math.round(rate * 10) / 10; // Round to 1 decimal
                    }
                  }
                }
              } catch (e) {
                // Skip post analysis
              } finally {
                await postPage.close();
              }
            }
          }
        } catch (e) {
          // Fall through to estimate
        }
      }

      // Fallback: Provide estimate based on follower count if we have followers but no engagement data
      if (followers > 0 && !avgEngagementRate) {
        // Industry benchmarks for Instagram engagement:
        // Micro-influencers (1K-10K): 3-5%
        // Small (10K-100K): 2-3%
        // Medium (100K-1M): 1-2%
        // Large (1M+): 0.5-1%
        if (followers < 10000) {
          avgEngagementRate = 4.0;
        } else if (followers < 100000) {
          avgEngagementRate = 2.5;
        } else if (followers < 1000000) {
          avgEngagementRate = 1.5;
        } else {
          avgEngagementRate = 0.75;
        }
      }

      return {
        followers,
        avgEngagementRate,
      };
    } catch (error: any) {
      console.error(`Instagram scraping error for ${handle}:`, error);
      return {
        followers: 0,
        error: error.message || "Failed to scrape Instagram",
      };
    } finally {
      await page.close();
    }
  }
}
