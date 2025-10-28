import { Router } from 'express';
import {
    getProductos,
    getProducto,
    createProducto,
    updateProducto,
    deleteProducto
} from '../controllers/productos.js';

const router = Router();

router.get('/productos', getProductos);
router.get('/productos/:id', getProducto);
router.post('/productos', createProducto);
router.put('/productos/:id', updateProducto);
router.delete('/productos/:id', deleteProducto);

export default router;