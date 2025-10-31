// src/db.js

import { createPool } from 'mysql2/promise';
import 'dotenv/config';

// 1. Creamos un objeto de configuración base
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 2. ¡LA LÓGICA CLAVE!
//    Render (y otros hostings) automáticamente establecen NODE_ENV a "production".
//    En tu PC, esta variable no existe, por lo que será "development".
if (process.env.NODE_ENV === 'production') {
  // 3. Si estamos "en vivo", añadimos la configuración SSL
  dbConfig.ssl = { "rejectUnauthorized": true };
}

// 4. Creamos el pool con la configuración condicional
export const pool = createPool(dbConfig);