import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { corsOptions } from './config/cors.config';
import { globalRateLimiter } from './config/rate-limit.config';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(globalRateLimiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  if (env.nodeEnv !== 'test') {
    app.use(morgan('combined'));
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.nodeEnv });
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api/v1', routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
