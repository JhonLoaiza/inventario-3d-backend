import { Router } from 'express';
import {
    getTrabajos,
    createTrabajo,
    completeTrabajo
} from '../controllers/trabajos.js';

const router = Router();

router.get('/trabajos', getTrabajos);
router.post('/trabajos', createTrabajo);
router.put('/trabajos/:id/completar', completeTrabajo);

export default router;