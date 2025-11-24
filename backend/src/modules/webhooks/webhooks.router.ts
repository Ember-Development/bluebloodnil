import { Router } from 'express';
import { handleBombersWebhook } from './webhooks.controller';

export const webhookRouter = Router();

webhookRouter.post('/bombers', handleBombersWebhook);

