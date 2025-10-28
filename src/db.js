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
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * ¿Por qué un "Pool" y no una "Conexión"?
 * * Profesor: Jhon, esto es clave. Un servidor web atiende a
 * muchas peticiones a la vez.
 * * - createConnection() (Malo): Abre UNA conexión. Si 100 usuarios
 * piden datos al mismo tiempo, 99 tienen que esperar a que el
 * primero termine. Es un cuello de botella.
 * * - createPool() (Bueno): Crea un "estanque" (ej. de 10 conexiones)
 * listas para usar. Cuando llega un usuario, toma una conexión,
 * la usa, y la devuelve al estanque. Es mucho más rápido
 * y eficiente para una API.
 */