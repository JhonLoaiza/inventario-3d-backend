import { pool } from '../db.js';

// --- LEER TODAS las bobinas (GET) ---
export const getBobinas = async (req, res) => {
    try {
        // ¡El JOIN es la clave! Unimos Bobinas con Materiales
        const [rows] = await pool.query(
            `SELECT 
                b.id, b.peso_inicial_g, b.peso_actual_g, b.costo_bobina, b.fecha_compra,
                m.tipo, m.marca, m.color
             FROM Bobinas b
             JOIN Materiales m ON b.material_id = m.id
             WHERE b.empresa_id = ?`,
            [1] // Asumimos empresa_id = 1
        );
        res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- LEER UNA bobina (GET /:id) ---
export const getBobina = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT 
                b.id, b.peso_inicial_g, b.peso_actual_g, b.costo_bobina, b.fecha_compra,
                m.tipo, m.marca, m.color
             FROM Bobinas b
             JOIN Materiales m ON b.material_id = m.id
             WHERE b.id = ? AND b.empresa_id = ?`,
            [id, 1]
        );

        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Bobina no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- CREAR una bobina (POST) ---
export const createBobina = async (req, res) => {
    try {
        const { material_id, peso_inicial_g, costo_bobina, fecha_compra } = req.body;

        // *** LÓGICA DE NEGOCIO CLAVE ***
        // Cuando una bobina es nueva, su peso actual ES su peso inicial.
        const peso_actual_g = peso_inicial_g; 
        
        const [rows] = await pool.query(
            'INSERT INTO Bobinas (material_id, peso_inicial_g, peso_actual_g, costo_bobina, fecha_compra, empresa_id) VALUES (?, ?, ?, ?, ?, ?)',
            [material_id, peso_inicial_g, peso_actual_g, costo_bobina, fecha_compra, 1]
        );
        
        res.status(201).json({
            id: rows.insertId,
            material_id,
            peso_inicial_g,
            peso_actual_g,
            costo_bobina,
            fecha_compra
        });
    } catch (error) {
        // Error común: el material_id no existe (Falla de Foreign Key)
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- ACTUALIZAR una bobina (PUT /:id) ---
// Nota: Generalmente no actualizaremos el 'peso_actual' manualmente.
// ¡Eso lo hará el Módulo de Producción!
// Aquí solo permitiremos cambiar, por ej., el costo o la fecha si nos equivocamos.
export const updateBobina = async (req, res) => {
    try {
        const { id } = req.params;
        const { costo_bobina, fecha_compra } = req.body;

        const [result] = await pool.query(
            'UPDATE Bobinas SET costo_bobina = IFNULL(?, costo_bobina), fecha_compra = IFNULL(?, fecha_compra) WHERE id = ? AND empresa_id = ?',
            [costo_bobina, fecha_compra, id, 1]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bobina no encontrada' });
        }

        const [rows] = await pool.query('SELECT * FROM Bobinas WHERE id = ?', [id]);
        res.json(rows[0]);

    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- BORRAR una bobina (DELETE /:id) ---
export const deleteBobina = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM Bobinas WHERE id = ? AND empresa_id = ?', [id, 1]);

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: 'Bobina no encontrada' });
        }
        
        res.sendStatus(204); 
    } catch (error) {
        // Error común: La bobina ya se usó en una impresión (Falla de Foreign Key)
        // ¡Esto es BUENO! Protege tu historial.
        return res.status(500).json({ message: 'No se puede borrar: Bobina con historial de trabajos', error: error.message });
    }
};