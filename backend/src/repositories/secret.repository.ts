// src/repositories/secret.repository.ts
import prisma from '../utils/db';
import { CreateSecretInput, UpdateSecretInput } from '../schemas/secret.schema';

export class SecretRepository {
  async create(userId: string, data: CreateSecretInput) {
    return prisma.secret.create({
      data: {
        title: data.title,
        type: data.type,
        content: data.content,
        userId,
      },
    });
  }

  async findById(id: string) {
    return prisma.secret.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return prisma.secret.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return prisma.secret.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateSecretInput) {
    return prisma.secret.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.secret.delete({
      where: { id },
    });
  }
}
