import { Router } from 'express';
import { getAllClients, getClientById, createClient } from '../controllers/client';

const router = Router();

router.get('/', getAllClients);

router.get('/:whatsapp', getClientById);

router.post('/', createClient);

export default router;
