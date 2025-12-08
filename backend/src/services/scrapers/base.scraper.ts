import puppeteer, { Browser, Page } from "puppeteer";

export interface ScrapedMetrics {
  followers: number;
  avgEngagementRate?: number;
  avgViews?: number;
  error?: string;
}

export interface ScraperConfig {
  timeout?: number;
  userAgent?: string;
  headless?: boolean;
}

export abstract class BaseScraper {
  protected browser: Browser | null = null;
  protected config: ScraperConfig;

  constructor(config: ScraperConfig = {}) {
    this.config = {
      timeout: parseInt(process.env.SCRAPING_TIMEOUT || "30000"),
      userAgent:
        process.env.SCRAPING_USER_AGENT ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      headless: process.env.SCRAPING_HEADLESS !== "false",
      ...config,
    };
  }

  protected async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
      });
    }
    return this.browser;
  }

  protected async createPage(): Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(this.config.userAgent!);
    await page.setViewport({ width: 1920, height: 1080 });
    return page;
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  abstract scrape(handle: string): Promise<ScrapedMetrics>;

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  protected parseNumber(text: string | null | undefined): number {
    if (!text) return 0;
    // Remove commas, K, M, B suffixes and convert
    const cleaned = text.trim().replace(/,/g, "").toLowerCase();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;

    if (cleaned.includes("k")) return Math.round(num * 1000);
    if (cleaned.includes("m")) return Math.round(num * 1000000);
    if (cleaned.includes("b")) return Math.round(num * 1000000000);
    return Math.round(num);
  }

  protected parsePercentage(
    text: string | null | undefined
  ): number | undefined {
    if (!text) return undefined;
    const cleaned = text.trim().replace(/%/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  }
}
