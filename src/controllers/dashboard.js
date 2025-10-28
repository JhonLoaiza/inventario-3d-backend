import { pool } from '../db.js';

// --- TU PREGUNTA: Valorizado total de Productos Terminados ---
export const getValorizadoProductos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT ROUND(SUM(stock_actual * precio_venta), 2) AS valor_total_inventario FROM Productos WHERE empresa_id = ?',
            [1] // Asumimos empresa_id = 1
        );
        
        // Si no hay productos, SUM devuelve NULL. Lo convertimos a 0.
        const valor_total = rows[0].valor_total_inventario || 0;

        res.json({
            valor_total_inventario: valor_total
        });
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};

// --- PREGUNTA FUTURA: Valorizado de Materia Prima (Filamento) ---
// ¿Cuánto dinero te queda en filamento?
export const getValorizadoMateriales = async (req, res) => {
    try {
        // Lógica: (costo / peso_inicial) = costo_por_gramo
        //          costo_por_gramo * peso_actual = valor_bobina_actual
        // SUM( ... ) = Valor total de todas las bobinas
        const [rows] = await pool.query(
            'SELECT ROUND(SUM((costo_bobina / peso_inicial_g) * peso_actual_g), 2) AS valor_total_materiales FROM Bobinas WHERE empresa_id = ?',
            [1]
        );
        
        const valor_total = rows[0].valor_total_materiales || 0;

        res.json({
            valor_total_materiales: valor_total
        });
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal', error: error.message });
    }
};