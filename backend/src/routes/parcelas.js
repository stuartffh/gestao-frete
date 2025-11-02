import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();
router.use(authenticateToken);

// Listar parcelas
router.get('/', async (req, res) => {
  try {
    const { conta_id, conta_tipo, status, dataInicio, dataFim, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM parcelas WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (conta_id) {
      query += ` AND conta_id = $${paramCount}`;
      params.push(conta_id);
      paramCount++;
    }
    if (conta_tipo) {
      query += ` AND conta_tipo = $${paramCount}`;
      params.push(conta_tipo);
      paramCount++;
    }
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

    query += ' ORDER BY data_vencimento ASC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      query.replace(/SELECT \*/, 'SELECT COUNT(*)').replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, ''),
      params.slice(0, -2)
    );

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
    console.error('Erro ao listar parcelas:', error);
    res.status(500).json({ error: 'Erro ao listar parcelas' });
  }
});

// Gerar parcelas a partir de uma conta
router.post('/gerar', hasPermission('parcelas:criar'), async (req, res) => {
  try {
    const { conta_id, conta_tipo, total_parcelas, valor_total, data_primeira, intervalo_dias } = req.body;

    if (!conta_id || !conta_tipo || !total_parcelas || !valor_total || !data_primeira) {
      return res.status(400).json({ error: 'Campos obrigatórios: conta_id, conta_tipo, total_parcelas, valor_total, data_primeira' });
    }

    const valor_parcela = parseFloat(valor_total) / parseInt(total_parcelas);
    const parcelas = [];
    const primeiraData = new Date(data_primeira);
    const diasIntervalo = intervalo_dias || 30; // Default mensal

    for (let i = 1; i <= total_parcelas; i++) {
      const dataVencimento = new Date(primeiraData);
      dataVencimento.setDate(primeiraData.getDate() + (diasIntervalo * (i - 1)));

      const parcela = await pool.query(
        `INSERT INTO parcelas (conta_id, conta_tipo, numero_parcela, total_parcelas, valor, data_vencimento, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pendente')
         RETURNING *`,
        [conta_id, conta_tipo, i, total_parcelas, valor_parcela, dataVencimento.toISOString().split('T')[0]]
      );

      parcelas.push(parcela.rows[0]);
    }

    await auditLog(req, 'CREATE', 'parcelas', conta_id, null, { total: parcelas.length });
    res.status(201).json({ message: `${total_parcelas} parcelas criadas com sucesso`, parcelas });
  } catch (error) {
    console.error('Erro ao gerar parcelas:', error);
    res.status(500).json({ error: 'Erro ao gerar parcelas' });
  }
});

// Marcar parcela como paga
router.patch('/:id/pagar', hasPermission('parcelas:pagar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { data_pagamento } = req.body;

    const result = await pool.query(
      `UPDATE parcelas SET status = 'paga', data_pagamento = COALESCE($1, CURRENT_DATE), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [data_pagamento, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parcela não encontrada' });
    }

    await auditLog(req, 'UPDATE', 'parcelas', id, null, result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao marcar parcela como paga:', error);
    res.status(500).json({ error: 'Erro ao marcar parcela como paga' });
  }
});

// Deletar parcelas de uma conta
router.delete('/conta/:conta_id/:conta_tipo', hasPermission('parcelas:deletar'), async (req, res) => {
  try {
    const { conta_id, conta_tipo } = req.params;
    await pool.query(
      'DELETE FROM parcelas WHERE conta_id = $1 AND conta_tipo = $2',
      [conta_id, conta_tipo]
    );
    await auditLog(req, 'DELETE', 'parcelas', conta_id, null, null);
    res.json({ message: 'Parcelas deletadas com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar parcelas:', error);
    res.status(500).json({ error: 'Erro ao deletar parcelas' });
  }
});

export default router;

