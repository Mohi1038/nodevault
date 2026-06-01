// src/controllers/secret.controller.ts
import { Request, Response, NextFunction } from 'express';
import { SecretService } from '../services/secret.service';

export class SecretController {
  private secretService = new SecretService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const result = await this.secretService.createSecret(currentUser, req.body);
      res.status(201).json({
        success: true,
        message: 'Secret stored securely in vault',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const result = await this.secretService.getSecrets(currentUser);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      if (!currentUser) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const result = await this.secretService.getSecretById(currentUser, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      if (!currentUser) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const result = await this.secretService.updateSecret(currentUser, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Secret updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      if (!currentUser) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const result = await this.secretService.deleteSecret(currentUser, id);
      res.status(200).json({
        success: true,
        message: result.message,
        data: { id: result.id },
      });
    } catch (error) {
      next(error);
    }
  };
}
