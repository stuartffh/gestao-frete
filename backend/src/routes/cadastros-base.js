import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();
router.use(authenticateToken);

// Helper para CRUD genérico
const createCRUDRoutes = (tableName, singularName, requiredFields = []) => {
  const routes = express.Router();

  // Listar
  routes.get('/', async (req, res) => {
    try {
      const { search, page = 1, limit = 20, deleted = false } = req.query;
      let query = `SELECT * FROM ${tableName} WHERE deleted_at IS ${deleted === 'true' ? 'NOT' : ''} NULL`;
      const params = [];
      let paramCount = 1;

      if (search) {
        query += ` AND (nome ILIKE $${paramCount} OR cpf_cnpj ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC';
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(parseInt(limit), offset);

      const result = await pool.query(query, params);
      const countResult = await pool.query(
        query.replace(/SELECT \*/, 'SELECT COUNT(*)').replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, ''),
        params.slice(0, -2)
      );
      const total = parseInt(countResult.rows[0].count);

      res.json({
        data: result.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
      });
    } catch (error) {
      console.error(`Erro ao listar ${singularName}:`, error);
      res.status(500).json({ error: `Erro ao listar ${singularName}` });
    }
  });

  // Buscar por ID
  routes.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `${singularName} não encontrado` });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`Erro ao buscar ${singularName}:`, error);
      res.status(500).json({ error: `Erro ao buscar ${singularName}` });
    }
  });

  // Criar
  routes.post('/', hasPermission(`${tableName}:criar`), async (req, res) => {
    try {
      const bodyFields = Object.keys(req.body).filter(f => f !== 'id' && f !== 'user_id' && f !== 'created_at' && f !== 'updated_at');
      const fields = [...bodyFields, 'user_id'];
      const params = [...bodyFields.map(f => req.body[f]), req.user.id];
      const placeholders = Array.from({ length: fields.length }, (_, i) => `$${i + 1}`).join(', ');

      const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await pool.query(query, params);

      await auditLog(req, 'CREATE', tableName, result.rows[0].id, null, result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(`Erro ao criar ${singularName}:`, error);
      res.status(500).json({ error: `Erro ao criar ${singularName}` });
    }
  });

  // Atualizar
  routes.put('/:id', hasPermission(`${tableName}:editar`), async (req, res) => {
    try {
      const beforeResult = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (beforeResult.rows.length === 0) {
        return res.status(404).json({ error: `${singularName} não encontrado` });
      }

      const fields = Object.keys(req.body).filter(f => f !== 'id');
      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const params = fields.map(f => req.body[f]);
      params.push(req.params.id);

      const query = `UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`;
      const result = await pool.query(query, params);

      await auditLog(req, 'UPDATE', tableName, req.params.id, beforeResult.rows[0], result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`Erro ao atualizar ${singularName}:`, error);
      res.status(500).json({ error: `Erro ao atualizar ${singularName}` });
    }
  });

  // Soft delete
  routes.delete('/:id', hasPermission(`${tableName}:deletar`), async (req, res) => {
    try {
      const beforeResult = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (beforeResult.rows.length === 0) {
        return res.status(404).json({ error: `${singularName} não encontrado` });
      }

      await pool.query(`UPDATE ${tableName} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`, [req.params.id]);
      await auditLog(req, 'DELETE', tableName, req.params.id, beforeResult.rows[0], null);
      res.json({ message: `${singularName} deletado com sucesso` });
    } catch (error) {
      console.error(`Erro ao deletar ${singularName}:`, error);
      res.status(500).json({ error: `Erro ao deletar ${singularName}` });
    }
  });

  // Restaurar (soft delete)
  routes.post('/:id/restore', hasPermission(`${tableName}:editar`), async (req, res) => {
    try {
      const result = await pool.query(`UPDATE ${tableName} SET deleted_at = NULL WHERE id = $1 RETURNING *`, [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `${singularName} não encontrado` });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`Erro ao restaurar ${singularName}:`, error);
      res.status(500).json({ error: `Erro ao restaurar ${singularName}` });
    }
  });

  return routes;
};

// Rotas para cada entidade
router.use('/clientes', createCRUDRoutes('clientes', 'Cliente'));
router.use('/fornecedores', createCRUDRoutes('fornecedores', 'Fornecedor'));
router.use('/veiculos', createCRUDRoutes('veiculos', 'Veículo'));
router.use('/motoristas', createCRUDRoutes('motoristas', 'Motorista'));

export default router;

