// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import secretRoutes from './secret.routes';

const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date(), message: 'API V1 is healthy' });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/secrets', secretRoutes);

export default apiRouter;
