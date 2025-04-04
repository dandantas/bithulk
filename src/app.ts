import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './api/middlewares/error_handler';
import { webhookRoutes } from './api/routes/webhook_routes';
import { logger } from './infra/logger/logger';

// Load environment variables
dotenv.config();

// Create Express app
const app: express.Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/webhooks', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

export default app;
