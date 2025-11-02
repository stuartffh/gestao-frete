import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import cron from 'node-cron';

const router = express.Router();
router.use(authenticateToken);

// Listar lançamentos recorrentes
router.get('/', async (req, res) => {
  try {
    const { ativo, tipo, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM lancamentos_recorrentes WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (ativo !== undefined) {
      query += ` AND ativo = $${paramCount}`;
      params.push(ativo === 'true');
      paramCount++;
    }
    if (tipo) {
      query += ` AND tipo = $${paramCount}`;
      params.push(tipo);
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
    console.error('Erro ao listar recorrências:', error);
    res.status(500).json({ error: 'Erro ao listar recorrências' });
  }
});

// Criar lançamento recorrente
router.post('/', hasPermission('recorrencias:criar'), async (req, res) => {
  try {
    const { descricao, valor, tipo, frequencia, dia_vencimento, data_inicio, data_fim, categoria } = req.body;

    if (!descricao || !valor || !tipo || !frequencia || !data_inicio) {
      return res.status(400).json({ error: 'Campos obrigatórios: descricao, valor, tipo, frequencia, data_inicio' });
    }

    const result = await pool.query(
      `INSERT INTO lancamentos_recorrentes (
        descricao, valor, tipo, frequencia, dia_vencimento, data_inicio, data_fim, categoria, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [descricao, valor, tipo, frequencia, dia_vencimento, data_inicio, data_fim, categoria, req.user.id]
    );

    await auditLog(req, 'CREATE', 'lancamentos_recorrentes', result.rows[0].id, null, result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar recorrência:', error);
    res.status(500).json({ error: 'Erro ao criar recorrência' });
  }
});

// Visualizar próximas parcelas geradas
router.get('/proximas', async (req, res) => {
  try {
    const { limite = 30 } = req.query;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + parseInt(limite));

    const result = await pool.query(
      `SELECT * FROM parcelas 
       WHERE status = 'pendente' AND data_vencimento <= $1
       ORDER BY data_vencimento ASC
       LIMIT 50`,
      [dataLimite.toISOString().split('T')[0]]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar próximas parcelas:', error);
    res.status(500).json({ error: 'Erro ao buscar próximas parcelas' });
  }
});

// Cancelar série de recorrência
router.patch('/:id/cancelar', hasPermission('recorrencias:editar'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE lancamentos_recorrentes SET ativo = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recorrência não encontrada' });
    }

    await auditLog(req, 'UPDATE', 'lancamentos_recorrentes', id, null, result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cancelar recorrência:', error);
    res.status(500).json({ error: 'Erro ao cancelar recorrência' });
  }
});

// Processar recorrências (executado via cron)
export async function processarRecorrencias() {
  try {
    const hoje = new Date();
    const diaMes = hoje.getDate();

    // Buscar recorrências ativas que devem ser processadas hoje
    const recorrencias = await pool.query(
      `SELECT * FROM lancamentos_recorrentes
       WHERE ativo = true
       AND data_inicio <= CURRENT_DATE
       AND (data_fim IS NULL OR data_fim >= CURRENT_DATE)
       AND (
         (frequencia = 'mensal' AND dia_vencimento = $1)
         OR (frequencia = 'quinzenal' AND (dia_vencimento = $1 OR dia_vencimento = $2))
         OR (frequencia = 'semanal' AND EXTRACT(DOW FROM CURRENT_DATE) = $3)
       )`,
      [diaMes, diaMes - 15, hoje.getDay()]
    );

    for (const rec of recorrencias.rows) {
      // Verificar se já foi gerado para este mês
      const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
      const existeMes = await pool.query(
        `SELECT id FROM parcelas 
         WHERE conta_id = $1 AND conta_tipo = $2 
         AND DATE_TRUNC('month', data_vencimento) = DATE_TRUNC('month', CURRENT_DATE)`,
        [rec.id, 'recorrente']
      );

      if (existeMes.rows.length === 0) {
        // Criar parcela da recorrência
        await pool.query(
          `INSERT INTO parcelas (conta_id, conta_tipo, numero_parcela, total_parcelas, valor, data_vencimento, status)
           VALUES ($1, 'recorrente', 1, 999, $2, $3, 'pendente')`,
          [rec.id, rec.valor, hoje.toISOString().split('T')[0]]
        );
      }
    }
  } catch (error) {
    console.error('Erro ao processar recorrências:', error);
  }
}

// Agendar processamento diário às 6h
cron.schedule('0 6 * * *', processarRecorrencias);

export default router;

