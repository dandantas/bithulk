import dotenv from 'dotenv';
import { PromptService } from '../services/prompt_service';
import { WebhookService } from '../services/webhook_service';
import { createAIProvider } from './ai_provider_factory';
import { BitbucketServiceFactory } from './bitbucket_service_factory';
import type { AppConfig } from '../../types/config';
import { defaultConfig } from '../../config/default_config';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Configuration options for WebhookService
 * @deprecated Use AppConfig instead
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
   * @deprecated Use createWithConfig instead
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

  /**
   * Create a WebhookService instance with the new config structure
   */
  static createWithConfig(config: Partial<AppConfig> = {}): WebhookService {
    // Create a deep merged config to ensure all required properties exist
    const mergedConfig: AppConfig = {
      ...defaultConfig,
      ...config,
      bitbucket: {
        ...defaultConfig.bitbucket,
        ...config.bitbucket,
      },
      ai: {
        provider: config.ai?.provider || defaultConfig.ai.provider,
        openai: {
          ...defaultConfig.ai.openai,
          ...config.ai?.openai,
        },
        deepseek: {
          ...defaultConfig.ai.deepseek,
          ...config.ai?.deepseek,
        },
      },
      events: {
        enabled: config.events?.enabled ?? defaultConfig.events.enabled,
        handlers: {
          pullRequestCreated: config.events?.handlers?.pullRequestCreated
            ? {
                enabled: config.events.handlers.pullRequestCreated.enabled ?? 
                  (defaultConfig.events.handlers.pullRequestCreated?.enabled || true),
                options: {
                  ...(defaultConfig.events.handlers.pullRequestCreated?.options || {
                    postComment: true,
                    reviewDepth: 'detailed',
                    timeLimit: 60,
                  }),
                  ...config.events.handlers.pullRequestCreated.options,
                },
              }
            : (defaultConfig.events.handlers.pullRequestCreated || {
                enabled: true,
                options: {
                  postComment: true,
                  reviewDepth: 'detailed',
                  timeLimit: 60,
                },
              }),
          repoPush: config.events?.handlers?.repoPush
            ? {
                enabled: config.events.handlers.repoPush.enabled ?? 
                  (defaultConfig.events.handlers.repoPush?.enabled || true),
                options: {
                  ...(defaultConfig.events.handlers.repoPush?.options || {
                    notifyChat: true,
                    branches: [],
                  }),
                  ...config.events.handlers.repoPush.options,
                },
              }
            : (defaultConfig.events.handlers.repoPush || {
                enabled: true,
                options: {
                  notifyChat: true,
                  branches: [],
                },
              }),
        },
      },
    };

    // Create BitbucketService with config
    const bitbucketService = BitbucketServiceFactory.create({
      apiToken: mergedConfig.bitbucket.accessToken,
      apiUrl: mergedConfig.bitbucket.apiUrl,
    });

    // Create AI provider
    const aiProvider = createAIProvider(
      mergedConfig.ai.provider,
      {
        openAIConfig: mergedConfig.ai.openai,
        deepSeekConfig: mergedConfig.ai.deepseek,
      }
    );

    // Create prompt service with specified language
    const promptService = new PromptService(mergedConfig.language || 'English');

    // Create and return WebhookService with dependencies and config
    return new WebhookService(bitbucketService, aiProvider, promptService, mergedConfig);
  }
}
