import express from 'express';
import { 
  WebhookServiceFactory, 
  WebhookHandler, 
  createWebhookMiddleware
} from '../src';
import type { AppConfig } from '../src';

// Create Express app
const app = express();
app.use(express.json());

// Example configuration
const config: AppConfig = {
  // Bitbucket configuration
  bitbucket: {
    apiUrl: 'https://api.bitbucket.org/2.0',
    accessToken: process.env.BITBUCKET_ACCESS_TOKEN,
    workspaceId: process.env.BITBUCKET_WORKSPACE_ID,
  },
  
  // AI provider configuration
  ai: {
    provider: 'openai', // or 'deepseek'
    
    // OpenAI specific config
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o',
      temperature: 0.1,
      maxTokens: 1500,
    },
    
    // DeepSeek specific config (only used when provider is 'deepseek')
    deepseek: {
      apiUrl: 'http://ollama:11434/api/generate',
      model: 'deepseek-r1:14b',
      temperature: 0.2,
      maxTokens: 2000,
    },
  },
  
  // Language for generated content
  language: 'English',
  
  // Event handler configuration
  events: {
    // Global enable/disable for all event handlers
    enabled: true,
    
    handlers: {
      // Pull request created event handler
      pullRequestCreated: {
        enabled: true,
        options: {
          // Whether to post a comment on the pull request
          postComment: true,
          // Level of detail for the review
          reviewDepth: 'detailed', // 'basic', 'detailed', or 'comprehensive'
          // Maximum time to spend on analysis (seconds)
          timeLimit: 60,
        },
      },
      
      // Repo push event handler 
      repoPush: {
        enabled: true,
        options: {
          // List of branches to monitor (if empty, all branches)
          branches: ['main', 'develop'],
          // Whether to notify on Google Chat
          notifyChat: true,
        },
      },
    },
  },
};

// Create webhook service with custom configuration
const webhookService = WebhookServiceFactory.createWithConfig(config);

// Create webhook handler
const webhookHandler = new WebhookHandler(webhookService);

// Handle Bitbucket webhooks using the middleware
app.post('/webhooks/bitbucket', createWebhookMiddleware(webhookHandler));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 