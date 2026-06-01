// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import secretRoutes from './secret.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/secrets', secretRoutes);

export default apiRouter;
