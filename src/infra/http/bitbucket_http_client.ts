import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { BitbucketApiConfig, BitbucketRateLimitInfo } from '../../types/bitbucket_api';
import { logger } from '../logger/logger';

/**
 * HTTP client for Bitbucket API
 */
export class BitbucketHttpClient {
  private client: AxiosInstance;
  private rateLimitInfo: BitbucketRateLimitInfo | null = null;
  private config: BitbucketApiConfig;

  constructor(config: BitbucketApiConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.bitbucket.org/2.0',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.accessToken}`,
      },
      timeout: 10000,
    });

    // Add response interceptor to capture rate limit information
    this.client.interceptors.response.use(
      (response) => {
        this.updateRateLimitInfo(response);
        return response;
      },
      (error) => {
        if (error.response) {
          this.updateRateLimitInfo(error.response);

          // Log API errors
          logger.error(
            `Bitbucket API error: ${error.response.status} - ${
              error.response.data?.error?.message || JSON.stringify(error.response.data)
            }`,
          );

          // Handle rate limiting
          if (error.response.status === 429) {
            logger.warn('Rate limit exceeded for Bitbucket API');
          }
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Make a GET request to the Bitbucket API
   */
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      logger.error(
        `Error making GET request to ${endpoint}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Make a POST request to the Bitbucket API
   */
  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(endpoint, data, config);
      return response.data;
    } catch (error: any) {
      console.log(error?.response?.data);
      logger.error(
        `Error making POST request to ${endpoint}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get current rate limit information
   */
  getRateLimitInfo(): BitbucketRateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Check if we're near the rate limit
   */
  isNearRateLimit(threshold = 10): boolean {
    if (!this.rateLimitInfo) return false;
    return this.rateLimitInfo.remaining <= threshold;
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(response: AxiosResponse): void {
    // Extract rate limit information from headers if available
    const limit = Number.parseInt(response.headers['x-ratelimit-limit'] || '0', 10);
    const remaining = Number.parseInt(response.headers['x-ratelimit-remaining'] || '0', 10);
    const reset = Number.parseInt(response.headers['x-ratelimit-reset'] || '0', 10);

    if (limit > 0) {
      this.rateLimitInfo = { limit, remaining, reset };
    }
  }
}
