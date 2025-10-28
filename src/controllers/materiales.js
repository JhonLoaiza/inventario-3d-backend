import { pool } from '../db.js'; // Salimos un nivel (../) para encontrar db.js

// --- LEER TODOS los materiales (GET) ---
export const getMateriales = async (req, res) => {
    try {
        // ¡ASUMIMOS QUE empresa_id = 1 por ahora!
        // Esto es clave para tu futuro SaaS
        const [rows] = await pool.query('SELECT * FROM Materiales WHERE empresa_id = ?', [1]);
        res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- LEER UN material (GET /:id) ---
export const getMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM Materiales WHERE id = ? AND empresa_id = ?', [id, 1]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Material no encontrado' });
        }
        res.json(rows[0]); // Devuelve solo el primero (y único)
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- CREAR un material (POST) ---
export const createMaterial = async (req, res) => {
    try {
        // req.body es el JSON que enviamos
        const { tipo, marca, color } = req.body;
        
        // ¡ASUMIMOS empresa_id = 1 por ahora!
        const [rows] = await pool.query(
            'INSERT INTO Materiales (tipo, marca, color, empresa_id) VALUES (?, ?, ?, ?)',
            [tipo, marca, color, 1]
        );
        
        // Devolvemos el objeto recién creado
        res.status(201).json({
            id: rows.insertId,
            tipo,
            marca,
            color,
            empresa_id: 1
        });
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- ACTUALIZAR un material (PUT /:id) ---
export const updateMaterial = async (req, res) => {
    try {
        const { id } = req.params; // El ID viene de la URL
        const { tipo, marca, color } = req.body; // Los datos vienen del body

        // Usamos IFNULL para actualizar solo lo que viene (parcial)
        const [result] = await pool.query(
            'UPDATE Materiales SET tipo = IFNULL(?, tipo), marca = IFNULL(?, marca), color = IFNULL(?, color) WHERE id = ? AND empresa_id = ?',
            [tipo, marca, color, id, 1]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Material no encontrado' });
        }

        // Devolvemos el material actualizado
        const [rows] = await pool.query('SELECT * FROM Materiales WHERE id = ?', [id]);
        res.json(rows[0]);

    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- BORRAR un material (DELETE /:id) ---
export const deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM Materiales WHERE id = ? AND empresa_id = ?', [id, 1]);

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: 'Material no encontrado' });
        }
        
        // 204 significa "Todo bien, pero no te devuelvo contenido"
        res.sendStatus(204); 
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};