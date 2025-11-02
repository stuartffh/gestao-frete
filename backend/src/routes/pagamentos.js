import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Listar pagamentos
router.get('/', async (req, res) => {
  try {
    const { tipo, dataInicio, dataFim, categoria, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM pagamentos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (tipo) {
      query += ` AND tipo = $${paramCount}`;
      params.push(tipo);
      paramCount++;
    }

    if (dataInicio) {
      query += ` AND data_pagamento >= $${paramCount}`;
      params.push(dataInicio);
      paramCount++;
    }

    if (dataFim) {
      query += ` AND data_pagamento <= $${paramCount}`;
      params.push(dataFim);
      paramCount++;
    }

    if (categoria) {
      query += ` AND categoria = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    query += ' ORDER BY data_pagamento DESC, created_at DESC';

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
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
});

// Buscar pagamento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM pagamentos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({ error: 'Erro ao buscar pagamento' });
  }
});

// Criar pagamento
router.post('/', hasPermission('pagamentos:criar'), async (req, res) => {
  try {
    const {
      descricao,
      valor,
      data_pagamento,
      tipo,
      categoria,
      beneficiario,
      forma_pagamento,
      observacoes,
      comprovante_path,
      conta_id,
      conta_tipo
    } = req.body;

    const result = await pool.query(
      `INSERT INTO pagamentos (
        descricao, valor, data_pagamento, tipo, categoria,
        beneficiario, forma_pagamento, observacoes, comprovante_path,
        conta_id, conta_tipo, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        descricao, valor, data_pagamento, tipo, categoria,
        beneficiario, forma_pagamento, observacoes, comprovante_path,
        conta_id, conta_tipo, req.user.id
      ]
    );

    // Atualizar status da conta relacionada
    if (conta_id && conta_tipo) {
      const statusField = conta_tipo === 'pagar' ? 'data_pagamento' : 'data_recebimento';
      const statusValue = conta_tipo === 'pagar' ? 'paga' : 'recebida';
      
      if (conta_tipo === 'pagar') {
        await pool.query(
          `UPDATE contas_pagar SET status = $1, ${statusField} = $2, comprovante_path = $3
           WHERE id = $4`,
          [statusValue, data_pagamento, comprovante_path, conta_id]
        );
      } else {
        await pool.query(
          `UPDATE contas_receber SET status = $1, ${statusField} = $2, comprovante_path = $3
           WHERE id = $4`,
          [statusValue, data_pagamento, comprovante_path, conta_id]
        );
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// Atualizar pagamento
router.put('/:id', hasPermission('pagamentos:editar'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      descricao,
      valor,
      data_pagamento,
      tipo,
      categoria,
      beneficiario,
      forma_pagamento,
      observacoes,
      comprovante_path
    } = req.body;

    const result = await pool.query(
      `UPDATE pagamentos SET
        descricao = $1, valor = $2, data_pagamento = $3, tipo = $4,
        categoria = $5, beneficiario = $6, forma_pagamento = $7,
        observacoes = $8, comprovante_path = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [
        descricao, valor, data_pagamento, tipo, categoria,
        beneficiario, forma_pagamento, observacoes, comprovante_path, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
});

// Deletar pagamento
router.delete('/:id', hasPermission('pagamentos:deletar'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM pagamentos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json({ message: 'Pagamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    res.status(500).json({ error: 'Erro ao deletar pagamento' });
  }
});

export default router;

