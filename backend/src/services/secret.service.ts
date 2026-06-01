// src/services/secret.service.ts
import { SecretRepository } from '../repositories/secret.repository';
import { CreateSecretInput, UpdateSecretInput } from '../schemas/secret.schema';
import { AppError } from '../middlewares/errorHandler';
import { TokenPayload } from '../utils/jwt';

export class SecretService {
  private secretRepository = new SecretRepository();

  async createSecret(currentUser: TokenPayload, data: CreateSecretInput) {
    return this.secretRepository.create(currentUser.userId, data);
  }

  async getSecrets(currentUser: TokenPayload) {
    if (currentUser.role === 'ADMIN') {
      return this.secretRepository.findAll();
    }
    return this.secretRepository.findByUserId(currentUser.userId);
  }

  async getSecretById(currentUser: TokenPayload, id: string) {
    const secret = await this.secretRepository.findById(id);
    if (!secret) {
      throw new AppError(404, 'Secret vault item not found', 'NOT_FOUND');
    }

    // RBAC: Only owner or admin can view
    if (secret.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
      throw new AppError(403, 'Access denied. You do not own this vault item.', 'FORBIDDEN');
    }

    return secret;
  }

  async updateSecret(currentUser: TokenPayload, id: string, data: UpdateSecretInput) {
    const secret = await this.secretRepository.findById(id);
    if (!secret) {
      throw new AppError(404, 'Secret vault item not found', 'NOT_FOUND');
    }

    // Only owner can update a secret item
    if (secret.userId !== currentUser.userId) {
      throw new AppError(403, 'Access denied. You do not own this vault item.', 'FORBIDDEN');
    }

    return this.secretRepository.update(id, data);
  }

  async deleteSecret(currentUser: TokenPayload, id: string) {
    const secret = await this.secretRepository.findById(id);
    if (!secret) {
      throw new AppError(404, 'Secret vault item not found', 'NOT_FOUND');
    }

    // Owner or Admin can delete
    if (secret.userId !== currentUser.userId && currentUser.role !== 'ADMIN') {
      throw new AppError(403, 'Access denied. You do not have permission to delete this.', 'FORBIDDEN');
    }

    await this.secretRepository.delete(id);
    return { id, message: 'Secret deleted successfully' };
  }
}
