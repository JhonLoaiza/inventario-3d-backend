import { pool } from '../db.js';

// --- LEER TODOS los productos (GET) ---
export const getProductos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Productos WHERE empresa_id = ?', [1]);
        res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- LEER UN producto (GET /:id) ---
export const getProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM Productos WHERE id = ? AND empresa_id = ?', [id, 1]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- CREAR un producto (POST) ---
export const createProducto = async (req, res) => {
    try {
        const { nombre, foto_url, precio_venta, gramos_estimados } = req.body;

        // *** LÓGICA DE NEGOCIO CLAVE ***
        // Cuando creas un producto en el catálogo, su stock inicial es CERO.
        // El stock se AÑADIRÁ después, cuando "fabriques" uno.
        const stock_actual = 0; 
        
        const [rows] = await pool.query(
            'INSERT INTO Productos (nombre, foto_url, precio_venta, gramos_estimados, stock_actual, empresa_id) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, foto_url, precio_venta, gramos_estimados, stock_actual, 1]
        );
        
        res.status(201).json({
            id: rows.insertId,
            nombre,
            precio_venta,
            stock_actual
        });
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- ACTUALIZAR un producto (PUT /:id) ---
export const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, foto_url, precio_venta, gramos_estimados } = req.body;

        const [result] = await pool.query(
            'UPDATE Productos SET nombre = IFNULL(?, nombre), foto_url = IFNULL(?, foto_url), precio_venta = IFNULL(?, precio_venta), gramos_estimados = IFNULL(?, gramos_estimados) WHERE id = ? AND empresa_id = ?',
            [nombre, foto_url, precio_venta, gramos_estimados, id, 1]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const [rows] = await pool.query('SELECT * FROM Productos WHERE id = ?', [id]);
        res.json(rows[0]);

    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- BORRAR un producto (DELETE /:id) ---
export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM Productos WHERE id = ? AND empresa_id = ?', [id, 1]);

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.sendStatus(204); 
    } catch (error) {
        // Error común: El producto ya se fabricó (está en Trabajos_Produccion)
        return res.status(500).json({ message: 'No se puede borrar: Producto con historial de producción', error: error.message });
    }
};