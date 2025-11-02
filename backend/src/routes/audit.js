import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);
router.use(authorize('admin')); // Apenas admin pode ver auditoria

// Listar logs de auditoria
router.get('/', async (req, res) => {
  try {
    const { entity_type, entity_id, user_id, action, page = 1, limit = 50 } = req.query;
    let query = `
      SELECT al.*, u.username, u.email
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (entity_type) {
      query += ` AND al.entity_type = $${paramCount}`;
      params.push(entity_type);
      paramCount++;
    }
    if (entity_id) {
      query += ` AND al.entity_id = $${paramCount}`;
      params.push(entity_id);
      paramCount++;
    }
    if (user_id) {
      query += ` AND al.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }
    if (action) {
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    query += ' ORDER BY al.created_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, ''), params.slice(0, -2));

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar auditoria:', error);
    res.status(500).json({ error: 'Erro ao listar logs de auditoria' });
  }
});

export default router;

