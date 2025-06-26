import { Router } from 'express';
import { createService, getAllServices } from '../controllers/service';

const router = Router();

router.get('/', getAllServices);

router.post('/', createService);

export default router;
