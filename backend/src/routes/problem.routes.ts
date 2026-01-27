/**
 * Problem Routes
 */
import { Router } from 'express';
import { z } from 'zod';
import * as problemController from '../controllers/problem.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';

const router = Router();

// Status update schema
const statusSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED']),
});

// Comment schema
const commentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
});

// All routes require authentication
router.use(authenticate);

// GET /api/v1/problems
router.get('/', problemController.getProblems);

// GET /api/v1/problems/:problemId
router.get('/:problemId', problemController.getProblemById);

// PATCH /api/v1/problems/:problemId/status
router.patch('/:problemId/status', validateBody(statusSchema), problemController.updateProblemStatus);

// POST /api/v1/problems/:problemId/comments
router.post('/:problemId/comments', validateBody(commentSchema), problemController.addComment);

export default router;
