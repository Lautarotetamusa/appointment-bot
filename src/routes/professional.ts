import { Router } from 'express';
import { getAllProfessionals, getProfessionalById, createProfessional, getServices, assignServiceToProfessional } from '../controllers/professional';

const router = Router();

router.get('/', getAllProfessionals);

router.get('/:id', getProfessionalById);

router.get('/:id/service', getServices);

router.post('/:profId/service/:serviceId', assignServiceToProfessional);

router.post('/', createProfessional);

export default router;
