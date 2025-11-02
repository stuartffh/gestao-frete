import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

const router = express.Router();
router.use(authenticateToken);

// Relatório de fluxo de caixa
router.get('/fluxo-caixa', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }

    // Contas a pagar
    const contasPagar = await pool.query(
      `SELECT 
        SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as total_pendente_pagar,
        SUM(CASE WHEN status = 'paga' THEN valor ELSE 0 END) as total_pago,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as qtd_pendente_pagar,
        COUNT(CASE WHEN status = 'paga' THEN 1 END) as qtd_pago
      FROM contas_pagar
      WHERE data_vencimento >= $1 AND data_vencimento <= $2`,
      [dataInicio, dataFim]
    );

    // Contas a receber
    const contasReceber = await pool.query(
      `SELECT 
        SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as total_pendente_receber,
        SUM(CASE WHEN status = 'recebida' THEN valor ELSE 0 END) as total_recebido,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as qtd_pendente_receber,
        COUNT(CASE WHEN status = 'recebida' THEN 1 END) as qtd_recebido
      FROM contas_receber
      WHERE data_vencimento >= $1 AND data_vencimento <= $2`,
      [dataInicio, dataFim]
    );

    // Pagamentos
    const pagamentos = await pool.query(
      `SELECT 
        SUM(CASE WHEN tipo = 'pagar' THEN valor ELSE 0 END) as total_pagamentos,
        SUM(CASE WHEN tipo = 'receber' THEN valor ELSE 0 END) as total_recebimentos,
        COUNT(*) as total_operacoes
      FROM pagamentos
      WHERE data_pagamento >= $1 AND data_pagamento <= $2`,
      [dataInicio, dataFim]
    );

    const saldo = (contasReceber.rows[0].total_recebido || 0) - (contasPagar.rows[0].total_pago || 0);

    res.json({
      periodo: { dataInicio, dataFim },
      contasPagar: contasPagar.rows[0],
      contasReceber: contasReceber.rows[0],
      pagamentos: pagamentos.rows[0],
      saldo,
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// Relatório por categoria
router.get('/categoria', async (req, res) => {
  try {
    const { dataInicio, dataFim, tipo } = req.query;

    let query;
    if (tipo === 'pagar') {
      query = `
        SELECT 
          categoria,
          COUNT(*) as quantidade,
          SUM(valor) as total,
          SUM(CASE WHEN status = 'paga' THEN valor ELSE 0 END) as total_pago,
          SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as total_pendente
        FROM contas_pagar
        WHERE data_vencimento >= $1 AND data_vencimento <= $2
        GROUP BY categoria
        ORDER BY total DESC
      `;
    } else if (tipo === 'receber') {
      query = `
        SELECT 
          categoria,
          COUNT(*) as quantidade,
          SUM(valor) as total,
          SUM(CASE WHEN status = 'recebida' THEN valor ELSE 0 END) as total_recebido,
          SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as total_pendente
        FROM contas_receber
        WHERE data_vencimento >= $1 AND data_vencimento <= $2
        GROUP BY categoria
        ORDER BY total DESC
      `;
    } else {
      return res.status(400).json({ error: 'Tipo deve ser "pagar" ou "receber"' });
    }

    const result = await pool.query(query, [dataInicio || '1900-01-01', dataFim || '2100-12-31']);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao gerar relatório por categoria:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// Exportar CSV
router.get('/exportar/csv', async (req, res) => {
  try {
    const { tipo, dataInicio, dataFim } = req.query;

    let query;
    let filename;

    if (tipo === 'pagar') {
      query = 'SELECT * FROM contas_pagar WHERE 1=1';
      filename = 'contas_pagar';
    } else if (tipo === 'receber') {
      query = 'SELECT * FROM contas_receber WHERE 1=1';
      filename = 'contas_receber';
    } else if (tipo === 'pagamentos') {
      query = 'SELECT * FROM pagamentos WHERE 1=1';
      filename = 'pagamentos';
    } else {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const params = [];
    let paramCount = 1;

    if (dataInicio) {
      const dateField = tipo === 'pagamentos' ? 'data_pagamento' : 'data_vencimento';
      query += ` AND ${dateField} >= $${paramCount}`;
      params.push(dataInicio);
      paramCount++;
    }

    if (dataFim) {
      const dateField = tipo === 'pagamentos' ? 'data_pagamento' : 'data_vencimento';
      query += ` AND ${dateField} <= $${paramCount}`;
      params.push(dataFim);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum dado encontrado' });
    }

    const headers = Object.keys(result.rows[0]);
    const csv = [
      headers.join(','),
      ...result.rows.map(row =>
        headers.map(header => {
          const value = row[header];
          return value !== null && value !== undefined
            ? `"${String(value).replace(/"/g, '""')}"`
            : '';
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.csv`);
    res.send('\uFEFF' + csv); // BOM para UTF-8
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    res.status(500).json({ error: 'Erro ao exportar CSV' });
  }
});

// Exportar XLSX
router.get('/exportar/xlsx', async (req, res) => {
  try {
    const { tipo, dataInicio, dataFim } = req.query;

    let query;
    let filename;

    if (tipo === 'pagar') {
      query = 'SELECT * FROM contas_pagar WHERE 1=1';
      filename = 'contas_pagar';
    } else if (tipo === 'receber') {
      query = 'SELECT * FROM contas_receber WHERE 1=1';
      filename = 'contas_receber';
    } else if (tipo === 'pagamentos') {
      query = 'SELECT * FROM pagamentos WHERE 1=1';
      filename = 'pagamentos';
    } else {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const params = [];
    let paramCount = 1;

    if (dataInicio) {
      const dateField = tipo === 'pagamentos' ? 'data_pagamento' : 'data_vencimento';
      query += ` AND ${dateField} >= $${paramCount}`;
      params.push(dataInicio);
      paramCount++;
    }

    if (dataFim) {
      const dateField = tipo === 'pagamentos' ? 'data_pagamento' : 'data_vencimento';
      query += ` AND ${dateField} <= $${paramCount}`;
      params.push(dataFim);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum dado encontrado' });
    }

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar XLSX:', error);
    res.status(500).json({ error: 'Erro ao exportar XLSX' });
  }
});

// Exportar PDF
router.get('/exportar/pdf', async (req, res) => {
  try {
    const { tipo, dataInicio, dataFim } = req.query;

    let query;
    let title;

    if (tipo === 'pagar') {
      query = 'SELECT * FROM contas_pagar WHERE 1=1';
      title = 'Contas a Pagar';
    } else if (tipo === 'receber') {
      query = 'SELECT * FROM contas_receber WHERE 1=1';
      title = 'Contas a Receber';
    } else if (tipo === 'pagamentos') {
      query = 'SELECT * FROM pagamentos WHERE 1=1';
      title = 'Pagamentos';
    } else {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const params = [];
    let paramCount = 1;

    if (dataInicio) {
      const dateField = tipo === 'pagamentos' ? 'data_pagamento' : 'data_vencimento';
      query += ` AND ${dateField} >= $${paramCount}`;
      params.push(dataInicio);
      paramCount++;
    }

    if (dataFim) {
      const dateField = tipo === 'pagamentos' ? 'data_pagamento' : 'data_vencimento';
      query += ` AND ${dateField} <= $${paramCount}`;
      params.push(dataFim);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum dado encontrado' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${title.toLowerCase().replace(/\s/g, '_')}_${Date.now()}.pdf`);

    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Período: ${dataInicio || 'Início'} até ${dataFim || 'Fim'}`, { align: 'center' });
    doc.moveDown(2);

    // Tabela
    const tableTop = doc.y;
    const itemHeight = 20;
    let y = tableTop;

    // Cabeçalho da tabela
    const headers = Object.keys(result.rows[0]).slice(0, 6); // Primeiras 6 colunas
    const colWidth = 500 / headers.length;

    headers.forEach((header, i) => {
      doc.fontSize(10).font('Helvetica-Bold')
        .text(String(header).substring(0, 15), 50 + (i * colWidth), y, { width: colWidth - 5 });
    });

    y += itemHeight;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 5;

    // Dados
    result.rows.forEach((row, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      headers.forEach((header, i) => {
        const value = String(row[header] || '').substring(0, 15);
        doc.fontSize(8).font('Helvetica')
          .text(value, 50 + (i * colWidth), y, { width: colWidth - 5 });
      });

      y += itemHeight;
    });

    doc.end();
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    res.status(500).json({ error: 'Erro ao exportar PDF' });
  }
});

export default router;

