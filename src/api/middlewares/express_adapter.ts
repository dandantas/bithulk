import type { NextFunction, Request, Response } from 'express';
import type { WebhookHandler } from '../../domain/handlers/webhook_handler';
import type { BitbucketEventType } from '../../types/bitbucket';

/**
 * Options for creating the webhook middleware
 */
export interface WebhookMiddlewareOptions {
  /**
   * Custom header to extract the event type from (default: 'x-event-key')
   */
  eventTypeHeader?: string;
}

/**
 * Creates an Express middleware for handling Bitbucket webhook requests
 *
 * @param webhookHandler The webhook handler instance
 * @param options Configuration options for the middleware
 * @returns Express middleware function
 */
export function createWebhookMiddleware(
  webhookHandler: WebhookHandler,
  options: WebhookMiddlewareOptions = {},
) {
  const { eventTypeHeader = 'x-event-key' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventType = req.headers[eventTypeHeader] as BitbucketEventType;

      if (!eventType) {
        return res.status(400).json({
          status: 'error',
          message: `Missing ${eventTypeHeader} header`,
        });
      }

      // Process the webhook event
      await webhookHandler.handleWebhookEvent(eventType, req.body);

      return res.status(200).json({
        status: 'success',
        message: `Webhook received: ${eventType}`,
      });
    } catch (error) {
      next(error);
    }
  };
}
