import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { webhookRouter } from './modules/webhooks/webhooks.router';

export const app = express();

app.use(cors());
app.use(json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/webhooks', webhookRouter);

