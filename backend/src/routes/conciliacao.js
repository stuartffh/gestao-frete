import express from 'express';
import fileUpload from 'express-fileupload';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// Upload e processar extrato bancário (CSV)
router.post('/extrato', hasPermission('conciliacao:conciliar'), async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Arquivo CSV requerido' });
    }

    const file = req.files.file;
    const csvContent = file.data.toString('utf-8');
    const lines = csvContent.split('\n').filter(l => l.trim());

    const transacoes = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      // Formato esperado: data,valor,descricao
      transacoes.push({
        data: values[0],
        valor: parseFloat(values[1]) || 0,
        descricao: values[2] || '',
      });
    }

    // Buscar contas para sugerir matches
    const sugestoes = [];
    for (const transacao of transacoes) {
      const matches = [];
      
      // Match por valor e data (tolerância de 2 dias)
      const dataInicio = new Date(transacao.data);
      dataInicio.setDate(dataInicio.getDate() - 2);
      const dataFim = new Date(transacao.data);
      dataFim.setDate(dataFim.getDate() + 2);

      // Buscar em contas a pagar
      const contasPagar = await pool.query(
        `SELECT id, descricao, valor, data_vencimento, data_pagamento, status
         FROM contas_pagar
         WHERE ABS(valor - $1) < 0.01
         AND data_vencimento BETWEEN $2 AND $3
         AND status = 'pendente'
         LIMIT 5`,
        [transacao.valor, dataInicio.toISOString().split('T')[0], dataFim.toISOString().split('T')[0]]
      );

      // Buscar em contas a receber
      const contasReceber = await pool.query(
        `SELECT id, descricao, valor, data_vencimento, data_recebimento, status
         FROM contas_receber
         WHERE ABS(valor - $1) < 0.01
         AND data_vencimento BETWEEN $2 AND $3
         AND status = 'pendente'
         LIMIT 5`,
        [transacao.valor, dataInicio.toISOString().split('T')[0], dataFim.toISOString().split('T')[0]]
      );

      matches.push(...contasPagar.rows.map(c => ({ ...c, tipo: 'pagar', score: calcularScore(transacao, c) })));
      matches.push(...contasReceber.rows.map(c => ({ ...c, tipo: 'receber', score: calcularScore(transacao, c) })));

      sugestoes.push({
        transacao,
        matches: matches.sort((a, b) => b.score - a.score).slice(0, 3), // Top 3 matches
      });
    }

    res.json({ sugestoes });
  } catch (error) {
    console.error('Erro ao processar extrato:', error);
    res.status(500).json({ error: 'Erro ao processar extrato' });
  }
});

// Calcular score de match
function calcularScore(transacao, conta) {
  let score = 0;
  
  // Match exato de valor = 50 pontos
  if (Math.abs(transacao.valor - parseFloat(conta.valor)) < 0.01) {
    score += 50;
  }
  
  // Match de data (exato = 30, próximo = 20, 2 dias = 10)
  const dataTrans = new Date(transacao.data);
  const dataConta = new Date(conta.data_vencimento || conta.data_pagamento || conta.data_recebimento);
  const diffDias = Math.abs((dataTrans - dataConta) / (1000 * 60 * 60 * 24));
  
  if (diffDias === 0) score += 30;
  else if (diffDias === 1) score += 20;
  else if (diffDias <= 2) score += 10;
  
  // Match de descrição (parcial) = até 20 pontos
  if (conta.descricao && transacao.descricao) {
    const palavrasConta = conta.descricao.toLowerCase().split(' ');
    const palavrasTrans = transacao.descricao.toLowerCase().split(' ');
    const palavrasComuns = palavrasConta.filter(p => palavrasTrans.includes(p)).length;
    score += Math.min(palavrasComuns * 5, 20);
  }
  
  return score;
}

// Confirmar match e atualizar conta
router.post('/confirmar-match', hasPermission('conciliacao:conciliar'), async (req, res) => {
  try {
    const { transacao, conta_id, conta_tipo } = req.body;

    if (conta_tipo === 'pagar') {
      await pool.query(
        `UPDATE contas_pagar 
         SET status = 'paga', data_pagamento = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [transacao.data, conta_id]
      );
    } else if (conta_tipo === 'receber') {
      await pool.query(
        `UPDATE contas_receber 
         SET status = 'recebida', data_recebimento = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [transacao.data, conta_id]
      );
    }

    res.json({ message: 'Match confirmado e conta atualizada' });
  } catch (error) {
    console.error('Erro ao confirmar match:', error);
    res.status(500).json({ error: 'Erro ao confirmar match' });
  }
});

export default router;

