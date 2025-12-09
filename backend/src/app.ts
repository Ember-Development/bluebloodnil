import express from "express";
import cors from "cors";
import { json } from "express";
import { webhookRouter } from "./modules/webhooks/webhooks.router";
import { authRouter } from "./modules/auth/auth.router";
import { athletesRouter } from "./modules/athletes/athletes.router";
import { adminRouter } from "./modules/admin/admin.router";
import { feedRouter } from "./modules/feed/feed.router";
import { notificationsRouter } from "./modules/notifications/notifications.router";
import integrationRouter from "./routes/intergration";
import { uploadRouter } from "./modules/upload/upload.router";

export const app = express();

app.use(cors());
app.use(json());

app.get("/", (req, res) => {
  res.send("Bluebloods API is alive");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/webhooks", webhookRouter);
app.use("/api/auth", authRouter);
app.use("/api/athletes", athletesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/feed", feedRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/integration", integrationRouter);
app.use("/api/upload", uploadRouter);
