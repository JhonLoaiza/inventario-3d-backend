import { Router } from 'express';
import {
    getValorizadoProductos,
    getValorizadoMateriales
} from '../controllers/dashboard.js';

const router = Router();

// Esta es la ruta para tu pregunta:
router.get('/dashboard/valorizado-productos', getValorizadoProductos);

// Esta es la ruta de bono:
router.get('/dashboard/valorizado-materiales', getValorizadoMateriales);


export default router;