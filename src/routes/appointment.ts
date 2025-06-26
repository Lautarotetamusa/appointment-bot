import { Router } from 'express';
import { getAllAppointments } from '../controllers/appointment';

const router = Router();

router.get('/', getAllAppointments);

export default router;
