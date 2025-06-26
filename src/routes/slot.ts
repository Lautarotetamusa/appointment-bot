import { Router } from 'express';
import { findSlots } from '../controllers/slot';

const router = Router();

router.get('/', findSlots);

export default router;
