import { Router } from 'express';
import { getTribes, syncTribes } from '../controllers/tribe.controller';

const router = Router();

router.get('/', getTribes);
router.post('/sync', syncTribes);

export default router;
