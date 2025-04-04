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

# For DeepSeek or other providers
DEEPSEEK_API_KEY=your-deepseek-api-key
```

### Configuration Options

You can also configure the service programmatically:

```typescript
const webhookService = WebhookServiceFactory.create({
  aiProviderType: 'openai', // 'openai' or 'deepseek'
  language: 'English',      // Language for generated content
  bitbucketApiToken: 'your-access-token',
  bitbucketApiUrl: 'https://api.bitbucket.org/2.0'
});
```

## Supported Events

BitHulk currently supports the following Bitbucket events:

- `repo:push` - When code is pushed to a repository
- `pullrequest:created` - When a pull request is created

## License

MIT
