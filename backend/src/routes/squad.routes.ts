import { Router } from 'express';
import { getSquads, syncSquads } from '../controllers/squad.controller';

const router = Router();

router.get('/', getSquads);
router.post('/sync', syncSquads);

export default router;
