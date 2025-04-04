import { Router } from 'express';
import { WebhookController } from '../controllers/webhook_controller';
import { validateWebhookRequest } from '../middlewares/webhook_validator';

const router = Router();
const webhookController = new WebhookController();

// Bitbucket webhook endpoint
router.post('/bitbucket', validateWebhookRequest, webhookController.handleWebhook);

export { router as webhookRoutes };
