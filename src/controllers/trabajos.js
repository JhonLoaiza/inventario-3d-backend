import { pool } from '../db.js';

// --- LEER TODOS los trabajos (GET) ---
export const getTrabajos = async (req, res) => {
    try {
        // Un JOIN complejo para traer toda la info
        const [rows] = await pool.query(
            `SELECT 
                t.id, t.nombre_trabajo, t.cantidad_producida, t.gramos_consumidos, t.estado, t.fecha_creacion,
                p.nombre as producto_nombre,
                m.color as material_color,
                m.tipo as material_tipo
             FROM Trabajos_Produccion t
             LEFT JOIN Productos p ON t.producto_id = p.id
             JOIN Bobinas b ON t.bobina_id = b.id
             JOIN Materiales m ON b.material_id = m.id
             WHERE t.empresa_id = ?
             ORDER BY t.fecha_creacion DESC`,
            [1]
        );
        res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- CREAR un trabajo (POST) ---
// Esto solo "agenda" el trabajo. No descuenta inventario aún.
export const createTrabajo = async (req, res) => {
    try {
        const { nombre_trabajo, bobina_id, producto_id, gramos_consumidos, cantidad_producida } = req.body;
        
        // El estado inicial siempre es 'Pendiente'
        const estado = 'Pendiente'; 
        
        const [rows] = await pool.query(
            'INSERT INTO Trabajos_Produccion (nombre_trabajo, bobina_id, producto_id, cantidad_producida, gramos_consumidos, estado, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre_trabajo, bobina_id, producto_id, cantidad_producida, gramos_consumidos, estado, 1]
        );
        
        res.status(201).json({
            id: rows.insertId,
            ...req.body,
            estado
        });
    } catch (error)
    {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- COMPLETAR un trabajo (PUT /:id/completar) ---
// ¡AQUÍ OCURRE LA MAGIA!
export const completeTrabajo = async (req, res) => {
    const connection = await pool.getConnection(); // Obtenemos una conexión del Pool
    try {
        const { id } = req.params;

        // 1. Obtenemos los datos del trabajo
        const [trabajos] = await connection.query('SELECT * FROM Trabajos_Produccion WHERE id = ? AND empresa_id = ?', [id, 1]);
        if (trabajos.length === 0) {
            throw new Error('Trabajo no encontrado');
        }
        const trabajo = trabajos[0];

        // 2. Verificamos que no esté ya completado
        if (trabajo.estado !== 'Pendiente') {
            throw new Error('El trabajo ya fue procesado (completado o fallido)');
        }

        // 3. ¡INICIAMOS LA TRANSACCIÓN!
        await connection.beginTransaction();

        // 4. (Operación A) Descontar el filamento de la Bobina
        await connection.query(
            'UPDATE Bobinas SET peso_actual_g = peso_actual_g - ? WHERE id = ?',
            [trabajo.gramos_consumidos, trabajo.bobina_id]
        );

        // 5. (Operación B) Incrementar el stock del Producto (si aplica)
        if (trabajo.producto_id) {
            await connection.query(
                'UPDATE Productos SET stock_actual = stock_actual + ? WHERE id = ?',
                [trabajo.cantidad_producida, trabajo.producto_id]
            );
        }
        
        // 6. (Operación C) Marcar el trabajo como 'Completado'
        await connection.query(
            "UPDATE Trabajos_Produccion SET estado = 'Completado' WHERE id = ?",
            [id]
        );

        // 7. ¡COMMIT! Confirmamos todos los cambios
        await connection.commit();

        res.json({ message: '¡Trabajo completado con éxito! Inventario actualizado.' });

    } catch (error) {
        // 8. ¡ROLLBACK! Si algo falló, revertimos todo
        await connection.rollback();
        return res.status(500).json({ message: 'Falló la transacción', error: error.message });
    } finally {
        // 9. ¡MUY IMPORTANTE! Devolvemos la conexión al Pool
        connection.release();
    }
};