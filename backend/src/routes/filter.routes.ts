/**
 * Filter Routes
 */
import { Router } from 'express';
import * as problemController from '../controllers/problem.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/filters/options
router.get('/options', problemController.getFilterOptions);

export default router;
