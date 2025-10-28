import { Router } from 'express';
import {
    getMateriales,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial
} from '../controllers/materiales.js';

const router = Router();

router.get('/materiales', getMateriales);
router.get('/materiales/:id', getMaterial);
router.post('/materiales', createMaterial);
router.put('/materiales/:id', updateMaterial);
router.delete('/materiales/:id', deleteMaterial);

export default router;