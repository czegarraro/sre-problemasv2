import { Router } from 'express';
import { automationController } from '../controllers/automation.controller';

const router = Router();

// /api/v1/automation
router.get('/runbooks', automationController.getRunbooks);
router.get('/history', automationController.getHistory);
router.get('/stats', automationController.getStats);

export default router;
