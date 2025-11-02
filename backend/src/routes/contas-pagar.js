import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar contas a pagar
router.get('/', async (req, res) => {
  try {
    const { status, dataInicio, dataFim, categoria, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM contas_pagar WHERE 1=1';
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
    
    // Contar total
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
    console.error('Erro ao listar contas a pagar:', error);
    res.status(500).json({ error: 'Erro ao listar contas a pagar' });
  }
});

// Buscar conta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM contas_pagar WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ error: 'Erro ao buscar conta a pagar' });
  }
});

// Criar conta a pagar
router.post('/', hasPermission('contas_pagar:criar'), async (req, res) => {
  try {
    const {
      descricao,
      valor,
      data_vencimento,
      data_pagamento,
      categoria,
      fornecedor,
      status,
      observacoes,
      comprovante_path
    } = req.body;

    const result = await pool.query(
      `INSERT INTO contas_pagar (
        descricao, valor, data_vencimento, data_pagamento,
        categoria, fornecedor, status, observacoes, comprovante_path, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        descricao, valor, data_vencimento, data_pagamento,
        categoria, fornecedor, status || 'pendente', observacoes, comprovante_path, req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    res.status(500).json({ error: 'Erro ao criar conta a pagar' });
  }
});

// Atualizar conta a pagar
router.put('/:id', hasPermission('contas_pagar:editar'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      descricao,
      valor,
      data_vencimento,
      data_pagamento,
      categoria,
      fornecedor,
      status,
      observacoes,
      comprovante_path
    } = req.body;

    const result = await pool.query(
      `UPDATE contas_pagar SET
        descricao = $1, valor = $2, data_vencimento = $3, data_pagamento = $4,
        categoria = $5, fornecedor = $6, status = $7, observacoes = $8,
        comprovante_path = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [
        descricao, valor, data_vencimento, data_pagamento,
        categoria, fornecedor, status, observacoes, comprovante_path, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({ error: 'Erro ao atualizar conta a pagar' });
  }
});

// Marcar como paga
router.patch('/:id/pagar', hasPermission('contas_pagar:pagar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { data_pagamento, comprovante_path } = req.body;

    const result = await pool.query(
      `UPDATE contas_pagar SET
        status = 'paga',
        data_pagamento = COALESCE($1, CURRENT_DATE),
        comprovante_path = COALESCE($2, comprovante_path),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *`,
      [data_pagamento, comprovante_path, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao marcar como paga:', error);
    res.status(500).json({ error: 'Erro ao marcar conta como paga' });
  }
});

// Deletar conta a pagar
router.delete('/:id', hasPermission('contas_pagar:deletar'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM contas_pagar WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada' });
    }

    res.json({ message: 'Conta a pagar deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ error: 'Erro ao deletar conta a pagar' });
  }
});

export default router;

