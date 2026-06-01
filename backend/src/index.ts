// src/index.ts
import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { logger } from './utils/logger';
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Middlewares
app.use(cors({
  origin: ['https://nodevault-glaa.vercel.app', 'http://localhost:5173', 'https://nodevault-two.vercel.app'],
  credentials: true
}));
app.use(express.json());

// 2. Request Logging via Winston & Morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message: string) => logger.http(message.trim()),
  },
}));

// 3. Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NodeVault API Documentation',
      version: '1.0.0',
      description: 'Production-ready REST API featuring JWT authentication, RBAC, and Secret Vault CRUD endpoints',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'], // Scan annotations in TS/JS files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 4. Health Check Route
app.get('/', (_req, res) => {
  res.status(200).json({ message: 'NodeVault API is running', version: '1.0.1', check: 'apiRouter should work' });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 5. Versioned API Routes
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);
app.use('/v1', apiRouter); 
app.use('/', apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    url: req.url,
    method: req.method
  });
});

// 6. Global Central Error Handler (Must be registered last)
app.use(errorHandler);

// 7. Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`⚡️ NodeVault Server is running at http://localhost:${PORT}`);
    logger.info(`📖 Interactive API Documentation is available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;
