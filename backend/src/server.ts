import dotenv from "dotenv";
import { app } from "./app";
import { socialMetricsScraperJob } from "./jobs/social-metrics-scraper.job";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Start background jobs
if (process.env.SCRAPING_ENABLED !== "false") {
  socialMetricsScraperJob.start();
}

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
  if (process.env.SCRAPING_ENABLED !== "false") {
    console.log("Social metrics scraping job enabled");
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  socialMetricsScraperJob.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  socialMetricsScraperJob.stop();
  process.exit(0);
});
