// src/db.js

// Usamos 'mysql2/promise' para poder usar async/await
import { createPool } from 'mysql2/promise';

// Importamos las variables de entorno
import 'dotenv/config';

// Creamos el "Pool" de conexiones
export const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306, // <-- ¡LÍNEA AÑADIDA! (Para leer el puerto 4000)
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    
    // --- ¡LA LÍNEA CLAVE PARA TiDB Y PLANETSCALE! ---
    ssl: { "rejectUnauthorized": true }
    // -----------------------------------------------
});