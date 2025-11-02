import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// Relatório geral por período
router.get('/periodo', async (req, res) => {
  try {
    const { dataInicio, dataFim, tipo = 'mensal' } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }

    let groupBy = 'DATE_TRUNC(\'month\', data_emissao)';
    if (tipo === 'semanal') {
      groupBy = 'DATE_TRUNC(\'week\', data_emissao)';
    } else if (tipo === 'anual') {
      groupBy = 'DATE_TRUNC(\'year\', data_emissao)';
    } else if (tipo === 'diario') {
      groupBy = 'DATE(data_emissao)';
    }

    const query = `
      SELECT 
        ${groupBy} as periodo,
        COUNT(*) as total_notas,
        SUM(valor) as valor_total,
        COUNT(CASE WHEN status = 'paga' THEN 1 END) as notas_pagas,
        SUM(CASE WHEN status = 'paga' THEN valor ELSE 0 END) as valor_pago,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as notas_pendentes,
        SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as valor_pendente
      FROM notas_fiscais
      WHERE data_emissao >= $1 AND data_emissao <= $2
      GROUP BY ${groupBy}
      ORDER BY periodo ASC
    `;

    const result = await pool.query(query, [dataInicio, dataFim]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// Relatório de status
router.get('/status', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    let query = `
      SELECT 
        status,
        COUNT(*) as quantidade,
        SUM(valor) as valor_total
      FROM notas_fiscais
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

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

    query += ' GROUP BY status ORDER BY quantidade DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de status:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de status' });
  }
});

// Relatório por emitente
router.get('/emitentes', async (req, res) => {
  try {
    const { dataInicio, dataFim, limit = 10 } = req.query;

    let query = `
      SELECT 
        emitente,
        COUNT(*) as quantidade,
        SUM(valor) as valor_total,
        AVG(valor) as valor_medio
      FROM notas_fiscais
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

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

    query += ` GROUP BY emitente ORDER BY valor_total DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de emitentes:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de emitentes' });
  }
});

// Relatório de desempenho (métricas principais)
router.get('/desempenho', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (dataInicio) {
      whereClause += ` AND data_emissao >= $${paramCount}`;
      params.push(dataInicio);
      paramCount++;
    }

    if (dataFim) {
      whereClause += ` AND data_emissao <= $${paramCount}`;
      params.push(dataFim);
      paramCount++;
    }

    const query = `
      SELECT 
        COUNT(*) as total_notas,
        SUM(valor) as valor_total,
        AVG(valor) as valor_medio,
        COUNT(CASE WHEN status = 'paga' THEN 1 END) as notas_pagas,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as notas_pendentes,
        COUNT(CASE WHEN status = 'vencida' THEN 1 END) as notas_vencidas,
        SUM(CASE WHEN status = 'paga' THEN valor ELSE 0 END) as valor_pago,
        SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as valor_pendente,
        SUM(CASE WHEN status = 'vencida' THEN valor ELSE 0 END) as valor_vencido,
        ROUND(
          (COUNT(CASE WHEN status = 'paga' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
          2
        ) as taxa_pagamento
      FROM notas_fiscais
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao gerar relatório de desempenho:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de desempenho' });
  }
});

// Exportar relatório para CSV
router.get('/exportar', async (req, res) => {
  try {
    const { dataInicio, dataFim, formato = 'csv' } = req.query;

    let query = 'SELECT * FROM notas_fiscais WHERE 1=1';
    const params = [];
    let paramCount = 1;

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

    query += ' ORDER BY data_emissao DESC';

    const result = await pool.query(query, params);

    if (formato === 'csv') {
      const headers = Object.keys(result.rows[0] || {});
      const csv = [
        headers.join(','),
        ...result.rows.map(row => 
          headers.map(header => {
            const value = row[header];
            return value !== null && value !== undefined ? `"${String(value).replace(/"/g, '""')}"` : '';
          }).join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio_notas.csv');
      res.send(csv);
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
});

export default router;

