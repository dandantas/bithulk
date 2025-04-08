import { Router } from 'express';
import { WebhookController } from '../controllers/webhook_controller';
import { validateWebhookRequest } from '../middlewares/webhook_validator';
import type { AppConfig } from '../../types/config';

const config : Partial<AppConfig> = {
  bitbucket: {
    apiUrl: 'https://api.bitbucket.org/2.0',
    accessToken: process.env.BITBUCKET_ACCESS_TOKEN,
    workspaceId: process.env.BITBUCKET_WORKSPACE_ID,
  },
  ai: {
    provider: 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  },
  language:'Portuguese (Brazil)', 
  events: {
    enabled: true,
    handlers: {
      pullRequestCreated: {
        enabled: true,
      },
    },
  },
};
const router: Router = Router();
const webhookController = new WebhookController(config);

// Bitbucket webhook endpoint
router.post('/bitbucket', validateWebhookRequest, webhookController.handleWebhook);

export { router as webhookRoutes };
