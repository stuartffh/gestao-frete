import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Listar contas a receber
router.get('/', async (req, res) => {
  try {
    const { status, dataInicio, dataFim, categoria, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM contas_receber WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (dataInicio) {
      query += ` AND data_vencimento >= $${paramCount}`;
      params.push(dataInicio);
      paramCount++;
    }

    if (dataFim) {
      query += ` AND data_vencimento <= $${paramCount}`;
      params.push(dataFim);
      paramCount++;
    }

    if (categoria) {
      query += ` AND categoria = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    query += ' ORDER BY data_vencimento ASC, created_at DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    
    const countQuery = query.replace(/SELECT \*/, 'SELECT COUNT(*)').replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, '');
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar contas a receber:', error);
    res.status(500).json({ error: 'Erro ao listar contas a receber' });
  }
});

// Buscar conta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM contas_receber WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a receber não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ error: 'Erro ao buscar conta a receber' });
  }
});

// Criar conta a receber
router.post('/', hasPermission('contas_receber:criar'), async (req, res) => {
  try {
    const {
      descricao,
      valor,
      data_vencimento,
      data_recebimento,
      categoria,
      cliente,
      status,
      observacoes,
      comprovante_path
    } = req.body;

    const result = await pool.query(
      `INSERT INTO contas_receber (
        descricao, valor, data_vencimento, data_recebimento,
        categoria, cliente, status, observacoes, comprovante_path, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        descricao, valor, data_vencimento, data_recebimento,
        categoria, cliente, status || 'pendente', observacoes, comprovante_path, req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    res.status(500).json({ error: 'Erro ao criar conta a receber' });
  }
});

// Atualizar conta a receber
router.put('/:id', hasPermission('contas_receber:editar'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      descricao,
      valor,
      data_vencimento,
      data_recebimento,
      categoria,
      cliente,
      status,
      observacoes,
      comprovante_path
    } = req.body;

    const result = await pool.query(
      `UPDATE contas_receber SET
        descricao = $1, valor = $2, data_vencimento = $3, data_recebimento = $4,
        categoria = $5, cliente = $6, status = $7, observacoes = $8,
        comprovante_path = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [
        descricao, valor, data_vencimento, data_recebimento,
        categoria, cliente, status, observacoes, comprovante_path, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a receber não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({ error: 'Erro ao atualizar conta a receber' });
  }
});

// Marcar como recebida
router.patch('/:id/receber', hasPermission('contas_receber:receber'), async (req, res) => {
  try {
    const { id } = req.params;
    const { data_recebimento, comprovante_path } = req.body;

    const result = await pool.query(
      `UPDATE contas_receber SET
        status = 'recebida',
        data_recebimento = COALESCE($1, CURRENT_DATE),
        comprovante_path = COALESCE($2, comprovante_path),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *`,
      [data_recebimento, comprovante_path, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a receber não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao marcar como recebida:', error);
    res.status(500).json({ error: 'Erro ao marcar conta como recebida' });
  }
});

// Deletar conta a receber
router.delete('/:id', hasPermission('contas_receber:deletar'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM contas_receber WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a receber não encontrada' });
    }

    res.json({ message: 'Conta a receber deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ error: 'Erro ao deletar conta a receber' });
  }
});

export default router;

