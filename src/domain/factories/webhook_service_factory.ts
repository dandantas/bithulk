import { WebhookService } from '../services/webhook_service';
import { BitbucketServiceFactory } from './bitbucket_service_factory';
import { createAIProvider } from './ai_provider_factory';
import dotenv from 'dotenv';
import { PromptService } from '../services/prompt_service';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Factory for creating WebhookService instances
 */
export class WebhookServiceFactory {
  /**
   * Create a WebhookService instance with proper dependencies
   */
  static create(): WebhookService {
    // Create BitbucketService using its factory
    const bitbucketService = BitbucketServiceFactory.create();
    
    const aiProviderType = (process.env.AI_PROVIDER_TYPE || 'deepseek') as 'openai' | 'deepseek';
    const aiProvider = createAIProvider(aiProviderType);
    const promptService = new PromptService('Portuguese (Brazil)');

    // Create and return WebhookService with dependencies
    return new WebhookService(bitbucketService, aiProvider, promptService);
  }
} 