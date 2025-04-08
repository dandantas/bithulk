# BitHulk

Bitbucket webhook handler for code analysis with AI. BitHulk processes Bitbucket webhook events and provides automated code analysis using AI.

## Installation

```bash
npm install bithulk
# or
yarn add bithulk
# or
pnpm add bithulk
```

Express is a peer dependency that you'll need to install separately:

```bash
npm install express cors
# or
yarn add express cors
# or
pnpm add express cors
```

## Usage

### Quick Start

Here's a simple example using Express:

```typescript
import express from 'express';
import { 
  WebhookServiceFactory, 
  WebhookHandler, 
  createWebhookMiddleware 
} from 'bithulk';

// Create Express app
const app = express();
app.use(express.json());

// Create webhook service with custom configuration
const webhookService = WebhookServiceFactory.create({
  aiProviderType: 'openai',
  language: 'English'
});

// Create webhook handler
const webhookHandler = new WebhookHandler(webhookService);

// Handle Bitbucket webhooks using the middleware
app.post('/webhooks/bitbucket', createWebhookMiddleware(webhookHandler));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Advanced Configuration

You can use the new configuration system for more advanced options:

```typescript
import express from 'express';
import { 
  WebhookServiceFactory, 
  WebhookHandler, 
  createWebhookMiddleware,
  AppConfig 
} from 'bithulk';

// Create Express app
const app = express();
app.use(express.json());

// Advanced configuration
const config: AppConfig = {
  bitbucket: {
    apiUrl: 'https://api.bitbucket.org/2.0',
    accessToken: process.env.BITBUCKET_ACCESS_TOKEN,
    workspaceId: process.env.BITBUCKET_WORKSPACE_ID,
  },
  ai: {
    provider: 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o',
      temperature: 0.1,
      maxTokens: 1500,
    },
  },
  language: 'English',
  events: {
    enabled: true,
    handlers: {
      pullRequestCreated: {
        enabled: true,
        options: {
          postComment: true,
          reviewDepth: 'detailed', // 'basic', 'detailed', or 'comprehensive'
          timeLimit: 60,
        },
      },
      repoPush: {
        enabled: true,
        options: {
          branches: ['main', 'develop'],
          notifyChat: true,
        },
      },
    },
  },
};

// Create webhook service with advanced configuration
const webhookService = WebhookServiceFactory.createWithConfig(config);

// Create webhook handler
const webhookHandler = new WebhookHandler(webhookService);

// Handle Bitbucket webhooks using the middleware
app.post('/webhooks/bitbucket', createWebhookMiddleware(webhookHandler));

app.listen(3000);
```

### Manual Integration

If you need more control over the webhook processing:

```typescript
import express from 'express';
import { 
  WebhookServiceFactory, 
  WebhookHandler 
} from 'bithulk';

// Create Express app
const app = express();
app.use(express.json());

// Create webhook service
const webhookService = WebhookServiceFactory.create();

// Create webhook handler
const webhookHandler = new WebhookHandler(webhookService);

// Handle Bitbucket webhooks
app.post('/webhooks/bitbucket', async (req, res, next) => {
  try {
    const eventType = req.headers['x-event-key'];
    await webhookHandler.handleWebhookEvent(eventType, req.body);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
});

app.listen(3000);
```

## Configuration

### Environment Variables

BitHulk uses the following environment variables:

```
# Bitbucket API
BITBUCKET_API_URL=https://api.bitbucket.org/2.0
BITBUCKET_WORKSPACE_ID=your-workspace-id
BITBUCKET_ACCESS_TOKEN=your-access-token

# AI Provider
AI_PROVIDER_TYPE=openai # or deepseek

# For OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o

# For DeepSeek or other providers
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_MODEL=deepseek-r1:14b
```

### Configuration Options

The configuration system supports several options that can be configured:

#### Bitbucket Configuration

```typescript
bitbucket: {
  apiUrl?: string;       // Bitbucket API URL
  accessToken?: string;  // Access token for authentication
  workspaceId?: string;  // Your Bitbucket workspace ID
}
```

#### AI Provider Configuration

```typescript
ai: {
  provider: 'openai' | 'deepseek';  // AI provider to use
  
  // OpenAI specific configuration
  openai?: {
    apiKey?: string;       // API key for OpenAI
    apiUrl?: string;       // Custom API endpoint
    model?: string;        // Model to use (default: gpt-4o)
    temperature?: number;  // Response randomness (0-1)
    maxTokens?: number;    // Maximum tokens in response
  };
  
  // DeepSeek specific configuration
  deepseek?: {
    apiUrl?: string;       // API endpoint for DeepSeek
    model?: string;        // Model to use
    temperature?: number;  // Response randomness (0-1)
    maxTokens?: number;    // Maximum tokens in response
  };
}
```

#### Event Handler Configuration

```typescript
events: {
  // Global switch to enable/disable all handlers
  enabled: boolean;
  
  handlers: {
    // Pull request created event handler
    pullRequestCreated?: {
      enabled: boolean;
      options?: {
        postComment?: boolean;  // Whether to post a comment on the PR
        reviewDepth?: 'basic' | 'detailed' | 'comprehensive';  // Level of detail
        timeLimit?: number;     // Maximum time for analysis (seconds)
      };
    };
    
    // Repository push event handler
    repoPush?: {
      enabled: boolean;
      options?: {
        branches?: string[];    // Branches to monitor (empty = all)
        notifyChat?: boolean;   // Whether to notify on Google Chat
      };
    };
  };
}
```

## Supported Events

BitHulk currently supports the following Bitbucket events:

- `repo:push` - When code is pushed to a repository
- `pullrequest:created` - When a pull request is created

## License

MIT
