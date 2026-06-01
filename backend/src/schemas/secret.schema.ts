// src/schemas/secret.schema.ts
import { z } from 'zod';

export const createSecretSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    type: z.enum(['PASSWORD', 'NOTE', 'KEY', 'OTHER']).default('NOTE'),
    content: z.string().min(1, 'Content is required'),
  }),
});

export const updateSecretSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
    type: z.enum(['PASSWORD', 'NOTE', 'KEY', 'OTHER']).optional(),
    content: z.string().min(1, 'Content is required').optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid secret ID format'),
  }),
});

export const getSecretSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid secret ID format'),
  }),
});

export type CreateSecretInput = z.infer<typeof createSecretSchema>['body'];
export type UpdateSecretInput = z.infer<typeof updateSecretSchema>['body'];
