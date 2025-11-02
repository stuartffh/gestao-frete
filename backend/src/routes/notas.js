import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// Listar todas as notas
router.get('/', async (req, res) => {
  try {
    const { status, dataInicio, dataFim, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM notas_fiscais WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (dataInicio) {
      query += ` AND data_emissao >= $${paramCount}`;
      params.push(dataInicio);
      paramCount++;
    }

    if (dataFim) {
      query += ` AND data_emissao <= $${paramCount}`;
      params.push(dataFim);
      paramCount++;
    }

    query += ' ORDER BY data_emissao DESC, created_at DESC';

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
    console.error('Erro ao listar notas:', error);
    res.status(500).json({ error: 'Erro ao listar notas fiscais' });
  }
});

// Buscar nota por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM notas_fiscais WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar nota:', error);
    res.status(500).json({ error: 'Erro ao buscar nota fiscal' });
  }
});

// Criar nova nota
router.post('/', async (req, res) => {
  try {
    const {
      numero,
      serie,
      emitente,
      destinatario,
      valor,
      data_emissao,
      data_vencimento,
      data_pagamento,
      status,
      tipo_frete,
      veiculo,
      motorista,
      observacoes,
      pdf_path,
      foto_path
    } = req.body;

    const result = await pool.query(
      `INSERT INTO notas_fiscais (
        numero, serie, emitente, destinatario, valor, data_emissao,
        data_vencimento, data_pagamento, status, tipo_frete, veiculo,
        motorista, observacoes, pdf_path, foto_path
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        numero, serie, emitente, destinatario, valor, data_emissao,
        data_vencimento, data_pagamento, status || 'pendente', tipo_frete,
        veiculo, motorista, observacoes, pdf_path, foto_path
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ error: 'Erro ao criar nota fiscal' });
  }
});

// Atualizar nota
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero,
      serie,
      emitente,
      destinatario,
      valor,
      data_emissao,
      data_vencimento,
      data_pagamento,
      status,
      tipo_frete,
      veiculo,
      motorista,
      observacoes,
      pdf_path,
      foto_path
    } = req.body;

    const result = await pool.query(
      `UPDATE notas_fiscais SET
        numero = $1, serie = $2, emitente = $3, destinatario = $4,
        valor = $5, data_emissao = $6, data_vencimento = $7,
        data_pagamento = $8, status = $9, tipo_frete = $10,
        veiculo = $11, motorista = $12, observacoes = $13,
        pdf_path = $14, foto_path = $15, updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *`,
      [
        numero, serie, emitente, destinatario, valor, data_emissao,
        data_vencimento, data_pagamento, status, tipo_frete,
        veiculo, motorista, observacoes, pdf_path, foto_path, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ error: 'Erro ao atualizar nota fiscal' });
  }
});

// Deletar nota
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM notas_fiscais WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    res.json({ message: 'Nota fiscal deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    res.status(500).json({ error: 'Erro ao deletar nota fiscal' });
  }
});

export default router;

