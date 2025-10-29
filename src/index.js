import express from 'express';
import 'dotenv/config'; // Carga las variables de .env
import { pool } from './db.js'; // Importamos nuestro pool
import cors from 'cors';

import 'dotenv/config';

// Importamos el enrutador
import materialesRoutes from './routes/materiales.routes.js';
import bobinasRoutes from './routes/bobinas.routes.js';
import productosRoutes from './routes/productos.routes.js'; // ¡NUEVO!
import trabajosRoutes from './routes/trabajos.routes.js'; // ¡NUEVO!
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();
app.use(cors());
app.use(express.json()); // Middleware para entender JSON

const port = process.env.PORT || 4000;

// --- ¡NUEVA RUTA DE SALUD (HEALTH CHECK)! ---
// Esta es la ruta que Railway "golpea" para ver si la app está viva.
app.get('/', (req, res) => {
    res.status(200).send('¡API de Inventario 3D está viva!');
});
// --- Conectamos las rutas ---
app.use('/api', materialesRoutes); // Todas las rutas empezarán con /api
app.use('/api', bobinasRoutes);
app.use('/api', productosRoutes);
app.use('/api', trabajosRoutes); 
app.use('/api', dashboardRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint no encontrado' });
});

// Arrancamos el servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});

console.log("--- PRUEBA v3: ¡El archivo CON CORS se está ejecutando! ---");