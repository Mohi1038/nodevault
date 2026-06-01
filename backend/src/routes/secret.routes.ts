// src/routes/secret.routes.ts
import { Router } from 'express';
import { SecretController } from '../controllers/secret.controller';
import { validate } from '../middlewares/validate';
import { auth } from '../middlewares/auth';
import { createSecretSchema, updateSecretSchema, getSecretSchema } from '../schemas/secret.schema';

const router = Router();
const controller = new SecretController();

// Apply auth middleware to all secrets routes
router.use(auth);

/**
 * @swagger
 * /secrets:
 *   post:
 *     summary: Create a new secret vault item
 *     tags: [Secrets]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: My Gmail Password
 *               type:
 *                 type: string
 *                 enum: [PASSWORD, NOTE, KEY, OTHER]
 *                 example: PASSWORD
 *               content:
 *                 type: string
 *                 example: mysecurepassword123
 *     responses:
 *       201:
 *         description: Secret stored securely
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(createSecretSchema), controller.create);

/**
 * @swagger
 * /secrets:
 *   get:
 *     summary: Retrieve secrets (regular user sees owned items, admin sees all items)
 *     tags: [Secrets]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Secrets retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /secrets/{id}:
 *   get:
 *     summary: Get a specific secret item (only owner or admin)
 *     tags: [Secrets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The secret UUID
 *     responses:
 *       200:
 *         description: Secret details retrieved
 *       403:
 *         description: Forbidden (not the owner)
 *       404:
 *         description: Secret not found
 */
router.get('/:id', validate(getSecretSchema), controller.getById);

/**
 * @swagger
 * /secrets/{id}:
 *   put:
 *     summary: Update a secret item (only owner)
 *     tags: [Secrets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The secret UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PASSWORD, NOTE, KEY, OTHER]
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Secret updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Secret not found
 */
router.put('/:id', validate(updateSecretSchema), controller.update);

/**
 * @swagger
 * /secrets/{id}:
 *   delete:
 *     summary: Delete a secret item (only owner or admin)
 *     tags: [Secrets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The secret UUID
 *     responses:
 *       200:
 *         description: Secret deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Secret not found
 */
router.delete('/:id', validate(getSecretSchema), controller.delete);

export default router;
