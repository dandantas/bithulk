import dotenv from 'dotenv';
import { BitbucketHttpClient } from '../../infra/http/bitbucket_http_client';
import type { BitbucketApiConfig } from '../../types/bitbucket_api';
import { BitbucketService } from '../services/bitbucket_service';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Factory for creating BitbucketService instances
 */
export class BitbucketServiceFactory {
  /**
   * Create a BitbucketService instance with proper dependencies
   */
  static create(): BitbucketService {
    // Get config from environment variables
    const config: BitbucketApiConfig = {
      baseUrl: process.env.BITBUCKET_API_URL || 'https://api.bitbucket.org/2.0',
      workspaceId: process.env.BITBUCKET_WORKSPACE_ID || 'test-workspace',
      accessToken: process.env.BITBUCKET_ACCESS_TOKEN || '',
    };

    // Validate required configuration
    if (!config.workspaceId) {
      throw new Error('BITBUCKET_WORKSPACE_ID environment variable is required');
    }

    if (!config.accessToken) {
      throw new Error('BITBUCKET_ACCESS_TOKEN environment variable is required');
    }

    // Create the HTTP client
    const httpClient = new BitbucketHttpClient(config);

    // Create and return the service
    return new BitbucketService(httpClient);
  }
}
