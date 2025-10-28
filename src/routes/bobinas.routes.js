import { Router } from 'express';
import {
    getBobinas,
    getBobina,
    createBobina,
    updateBobina,
    deleteBobina
} from '../controllers/bobinas.js';

const router = Router();

router.get('/bobinas', getBobinas);
router.get('/bobinas/:id', getBobina);
router.post('/bobinas', createBobina);
router.put('/bobinas/:id', updateBobina);
router.delete('/bobinas/:id', deleteBobina);

export default router;