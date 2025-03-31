# BitHulk

BitHulk is a service that receives Bitbucket repository webhook events, analyzes code changes using AI, and sends concise summaries to authors via Google Chat.

## Features

- Receives webhook events from Bitbucket repositories
- Analyzes code changes with OpenAI
- Sends summaries to commit authors via Google Chat
- Provides insights into code quality and potential issues

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Bitbucket repository with admin access
- OpenAI API key
- Google Chat API access

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bithulk.git
   cd bithulk
   ```

2. Copy the example environment file and fill in your credentials:
   ```
   cp .env.example .env
   ```

### Running with Docker

Build and start the containers:

```bash
docker-compose up -d
```

The service will be available at http://localhost:3000

### Configuring Bitbucket Webhooks

1. Go to your Bitbucket repository settings
2. Navigate to Webhooks and add a new webhook
3. Set the URL to your deployed BitHulk instance: `https://your-domain.com/api/webhooks/bitbucket`
4. Select the `Repository Push` event
5. Save the webhook

## Development

### Running with Docker

```bash
# Start development server
docker-compose up -d

# View logs
docker-compose logs -f

# Run tests
docker-compose exec app npm test
```

### API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/webhooks/bitbucket` - Bitbucket webhook endpoint

## Architecture

BitHulk follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Core business logic and service interfaces
- **Infrastructure Layer**: External services integrations (Bitbucket API, OpenAI, Google Chat)
- **API Layer**: Controllers, routes, and middleware
- **Types**: TypeScript types and interfaces

## Project Structure

```
├── src/
│   ├── api/                # API Layer
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API routes
│   │   └── validators/     # Request validation
│   ├── domain/             # Domain Layer
│   │   ├── entities/       # Domain entities
│   │   └── services/       # Domain services
│   ├── infra/              # Infrastructure Layer
│   │   ├── http/           # HTTP clients
│   │   └── logger/         # Logging
│   ├── types/              # TypeScript types
│   └── app.ts              # Application entry point
```

## License

[MIT License](LICENSE)
