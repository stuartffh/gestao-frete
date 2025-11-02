import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import PDFDocument from 'pdfkit';

const router = express.Router();
router.use(authenticateToken);

// Abrir caixa diário
router.post('/abrir', hasPermission('caixa:abrir'), async (req, res) => {
  try {
    const { data, saldo_inicial } = req.body;
    const dataCaixa = data || new Date().toISOString().split('T')[0];

    // Verificar se já existe caixa aberto para esta data
    const existe = await pool.query('SELECT id FROM caixa_diario WHERE data = $1', [dataCaixa]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Caixa já aberto para esta data' });
    }

    const result = await pool.query(
      `INSERT INTO caixa_diario (data, saldo_inicial, status, user_id)
       VALUES ($1, $2, 'aberto', $3)
       RETURNING *`,
      [dataCaixa, saldo_inicial || 0, req.user.id]
    );

    await auditLog(req, 'CREATE', 'caixa_diario', result.rows[0].id, null, result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao abrir caixa:', error);
    res.status(500).json({ error: 'Erro ao abrir caixa' });
  }
});

// Fechar caixa diário
router.post('/fechar/:id', hasPermission('caixa:fechar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { saldo_final } = req.body;

    // Calcular totais do dia
    const dataCaixa = await pool.query('SELECT data FROM caixa_diario WHERE id = $1', [id]);
    if (dataCaixa.rows.length === 0) {
      return res.status(404).json({ error: 'Caixa não encontrado' });
    }

    const data = dataCaixa.rows[0].data;

    // Calcular entradas e saídas do dia
    const receitas = await pool.query(
      `SELECT SUM(valor) as total FROM contas_receber WHERE data_recebimento = $1 AND status = 'recebida'`,
      [data]
    );
    const despesas = await pool.query(
      `SELECT SUM(valor) as total FROM contas_pagar WHERE data_pagamento = $1 AND status = 'paga'`,
      [data]
    );

    const totalReceitas = parseFloat(receitas.rows[0].total || 0);
    const totalDespesas = parseFloat(despesas.rows[0].total || 0);
    const saldoCalculado = (await pool.query('SELECT saldo_inicial FROM caixa_diario WHERE id = $1', [id])).rows[0].saldo_inicial + totalReceitas - totalDespesas;

    const result = await pool.query(
      `UPDATE caixa_diario 
       SET saldo_final = COALESCE($1, $2), status = 'fechado', updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [saldo_final, saldoCalculado, id]
    );

    await auditLog(req, 'UPDATE', 'caixa_diario', id, null, result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    res.status(500).json({ error: 'Erro ao fechar caixa' });
  }
});

// Fechamento mensal
router.post('/fechamento-mensal', hasPermission('caixa:fechar'), async (req, res) => {
  try {
    const { mes, ano } = req.body;
    const mesAtual = mes || new Date().getMonth() + 1;
    const anoAtual = ano || new Date().getFullYear();

    // Verificar se já existe fechamento para este mês
    const existe = await pool.query(
      'SELECT id FROM fechamento_mensal WHERE mes = $1 AND ano = $2',
      [mesAtual, anoAtual]
    );

    if (existe.rows.length > 0 && existe.rows[0].trava_edicao) {
      return res.status(400).json({ error: 'Mês já fechado e travado' });
    }

    // Calcular saldos
    const primeiraData = new Date(anoAtual, mesAtual - 1, 1);
    const ultimaData = new Date(anoAtual, mesAtual, 0);

    const receitas = await pool.query(
      `SELECT SUM(valor) as total FROM contas_receber 
       WHERE data_recebimento >= $1 AND data_recebimento <= $2 AND status = 'recebida'`,
      [primeiraData.toISOString().split('T')[0], ultimaData.toISOString().split('T')[0]]
    );

    const despesas = await pool.query(
      `SELECT SUM(valor) as total FROM contas_pagar 
       WHERE data_pagamento >= $1 AND data_pagamento <= $2 AND status = 'paga'`,
      [primeiraData.toISOString().split('T')[0], ultimaData.toISOString().split('T')[0]]
    );

    // Buscar saldo inicial do mês anterior
    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
    const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;
    const fechamentoAnterior = await pool.query(
      'SELECT saldo_final FROM fechamento_mensal WHERE mes = $1 AND ano = $2',
      [mesAnterior, anoAnterior]
    );

    const saldoInicial = fechamentoAnterior.rows.length > 0 ? parseFloat(fechamentoAnterior.rows[0].saldo_final) : 0;
    const totalReceitas = parseFloat(receitas.rows[0].total || 0);
    const totalDespesas = parseFloat(despesas.rows[0].total || 0);
    const saldoFinal = saldoInicial + totalReceitas - totalDespesas;

    // Criar snapshot
    const snapshot = {
      saldo_inicial: saldoInicial,
      total_receitas: totalReceitas,
      total_despesas: totalDespesas,
      saldo_final: saldoFinal,
      data_snapshot: new Date().toISOString(),
    };

    const result = await pool.query(
      `INSERT INTO fechamento_mensal (mes, ano, saldo_inicial, total_receitas, total_despesas, saldo_final, snapshot, fechado_em, fechado_por, trava_edicao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8, true)
       ON CONFLICT (mes, ano) DO UPDATE SET
         saldo_inicial = EXCLUDED.saldo_inicial,
         total_receitas = EXCLUDED.total_receitas,
         total_despesas = EXCLUDED.total_despesas,
         saldo_final = EXCLUDED.saldo_final,
         snapshot = EXCLUDED.snapshot,
         fechado_em = CURRENT_TIMESTAMP,
         fechado_por = EXCLUDED.fechado_por,
         trava_edicao = true
       RETURNING *`,
      [mesAtual, anoAtual, saldoInicial, totalReceitas, totalDespesas, saldoFinal, JSON.stringify(snapshot), req.user.id]
    );

    await auditLog(req, 'CREATE', 'fechamento_mensal', result.rows[0].id, null, result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao fechar mês:', error);
    res.status(500).json({ error: 'Erro ao fechar mês' });
  }
});

// Verificar se mês está travado
router.get('/fechamento-mensal/verificar/:mes/:ano', async (req, res) => {
  try {
    const { mes, ano } = req.params;
    const result = await pool.query(
      'SELECT trava_edicao, fechado_em FROM fechamento_mensal WHERE mes = $1 AND ano = $2',
      [mes, ano]
    );

    res.json({
      fechado: result.rows.length > 0,
      trava_edicao: result.rows[0]?.trava_edicao || false,
      fechado_em: result.rows[0]?.fechado_em || null,
    });
  } catch (error) {
    console.error('Erro ao verificar fechamento:', error);
    res.status(500).json({ error: 'Erro ao verificar fechamento' });
  }
});

// Relatório PDF do mês
router.get('/fechamento-mensal/relatorio-pdf/:mes/:ano', hasPermission('caixa:relatorio'), async (req, res) => {
  try {
    const { mes, ano } = req.params;
    const fechamento = await pool.query(
      'SELECT * FROM fechamento_mensal WHERE mes = $1 AND ano = $2',
      [mes, ano]
    );

    if (fechamento.rows.length === 0) {
      return res.status(404).json({ error: 'Fechamento não encontrado' });
    }

    const dados = fechamento.rows[0];
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=fechamento_${mes}_${ano}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Fechamento Mensal', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`${mes}/${ano}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12);
    doc.text(`Saldo Inicial: R$ ${dados.saldo_inicial.toFixed(2)}`, 50, doc.y);
    doc.moveDown();
    doc.text(`Total Receitas: R$ ${dados.total_receitas.toFixed(2)}`, 50, doc.y);
    doc.moveDown();
    doc.text(`Total Despesas: R$ ${dados.total_despesas.toFixed(2)}`, 50, doc.y);
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text(`Saldo Final: R$ ${dados.saldo_final.toFixed(2)}`, 50, doc.y);
    doc.moveDown(2);

    doc.fontSize(10);
    doc.text(`Fechado em: ${new Date(dados.fechado_em).toLocaleString('pt-BR')}`, 50, doc.y);
    
    doc.end();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório PDF' });
  }
});

export default router;

