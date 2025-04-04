import dotenv from 'dotenv';
import { PromptService } from '../services/prompt_service';
import { WebhookService } from '../services/webhook_service';
import { createAIProvider } from './ai_provider_factory';
import { BitbucketServiceFactory } from './bitbucket_service_factory';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Configuration options for WebhookService
 */
export interface WebhookServiceOptions {
  aiProviderType?: 'openai' | 'deepseek';
  language?: string;
  bitbucketApiToken?: string;
  bitbucketApiUrl?: string;
}

/**
 * Factory for creating WebhookService instances
 */

export class WebhookServiceFactory {
  /**
   * Create a WebhookService instance with customizable options
   */
  static create(options: WebhookServiceOptions = {}): WebhookService {
    const {
      aiProviderType = (process.env.AI_PROVIDER_TYPE || 'deepseek') as 'openai' | 'deepseek',
      language = process.env.LANGUAGE || 'English',
      bitbucketApiToken = process.env.BITBUCKET_API_TOKEN,
      bitbucketApiUrl = process.env.BITBUCKET_API_URL,
    } = options;

    // Create BitbucketService with optional custom configuration
    const bitbucketService = BitbucketServiceFactory.create({
      apiToken: bitbucketApiToken,
      apiUrl: bitbucketApiUrl,
    });

    // Create AI provider
    const aiProvider = createAIProvider(aiProviderType);

    // Create prompt service with specified language
    const promptService = new PromptService(language);

    // Create and return WebhookService with dependencies
    return new WebhookService(bitbucketService, aiProvider, promptService);
  }
}
