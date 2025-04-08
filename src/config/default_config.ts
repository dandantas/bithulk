import type { AppConfig } from '../types/config';

import dotenv from 'dotenv';
dotenv.config();

/**
 * Default application configuration
 * Contains sensible defaults that can be overridden
 */
export const defaultConfig: AppConfig = {
  bitbucket: {
    apiUrl: 'https://api.bitbucket.org/2.0',
    accessToken: process.env.BITBUCKET_ACCESS_TOKEN,
    workspaceId: process.env.BITBUCKET_WORKSPACE_ID,
  },
  ai: {
    provider: 'openai',
    openai: {
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 1000,
    },
    deepseek: {
      apiUrl: 'http://ollama:11434/api/generate',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-r1:14b',
      temperature: 0.1,
      maxTokens: 1000,
    },
  },
  language: 'English',
  events: {
    enabled: false,
    handlers: {
      pullRequestCreated: {
        enabled: false,
        options: {
          postComment: true,
          reviewDepth: 'detailed',
          timeLimit: 30,
        },
      },
      repoPush: {
        enabled: false,
        options: {
          notifyChat: false,
        },
      },
    },
  },
};
