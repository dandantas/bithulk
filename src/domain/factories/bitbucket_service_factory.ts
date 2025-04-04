import dotenv from 'dotenv';
import { BitbucketHttpClient } from '../../infra/http/bitbucket_http_client';
import type { BitbucketApiConfig } from '../../types/bitbucket_api';
import { BitbucketService } from '../services/bitbucket_service';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Configuration options for BitbucketService
 */
export interface BitbucketServiceOptions {
  apiUrl?: string;
  apiToken?: string;
  workspaceId?: string;
}

/**
 * Factory for creating BitbucketService instances
 */
export class BitbucketServiceFactory {
  /**
   * Create a BitbucketService instance with customizable options
   */
  static create(options: BitbucketServiceOptions = {}): BitbucketService {
    const {
      apiUrl = process.env.BITBUCKET_API_URL,
      apiToken = process.env.BITBUCKET_ACCESS_TOKEN,
      workspaceId = process.env.BITBUCKET_WORKSPACE_ID,
    } = options;

    // Get config from environment variables or options
    const config: BitbucketApiConfig = {
      baseUrl: apiUrl || 'https://api.bitbucket.org/2.0',
      workspaceId: workspaceId || 'test-workspace',
      accessToken: apiToken || '',
    };

    // Validate required configuration
    if (!config.workspaceId) {
      throw new Error(
        'BITBUCKET_WORKSPACE_ID environment variable or workspaceId option is required',
      );
    }

    if (!config.accessToken) {
      throw new Error('BITBUCKET_ACCESS_TOKEN environment variable or apiToken option is required');
    }

    // Create the HTTP client
    const httpClient = new BitbucketHttpClient(config);

    // Create and return the service
    return new BitbucketService(httpClient);
  }
}
