import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// Listar alertas do usuário
router.get('/', async (req, res) => {
  try {
    const { lido } = req.query;
    let query = 'SELECT * FROM alertas WHERE user_id = $1';
    const params = [req.user.id];

    if (lido !== undefined) {
      query += ' AND lido = $2';
      params.push(lido === 'true');
    }

    query += ' ORDER BY created_at DESC LIMIT 50';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar alertas:', error);
    res.status(500).json({ error: 'Erro ao listar alertas' });
  }
});

// Marcar como lido
router.patch('/:id/lido', async (req, res) => {
  try {
    await pool.query('UPDATE alertas SET lido = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Alerta marcado como lido' });
  } catch (error) {
    console.error('Erro ao marcar alerta:', error);
    res.status(500).json({ error: 'Erro ao marcar alerta' });
  }
});

// Contar alertas não lidos
router.get('/nao-lidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM alertas WHERE user_id = $1 AND lido = false', [req.user.id]);
    res.json({ count: parseInt(result.rows[0].total) });
  } catch (error) {
    console.error('Erro ao contar alertas:', error);
    res.status(500).json({ error: 'Erro ao contar alertas' });
  }
});

// Função para criar alertas de vencimento (executada via cron)
export async function criarAlertasVencimento() {
  try {
    const hoje = new Date();
    const diasAlerta = [0, 1, 3, 7]; // Hoje, 1 dia, 3 dias, 7 dias

    for (const dias of diasAlerta) {
      const dataAlerta = new Date(hoje);
      dataAlerta.setDate(dataAlerta.getDate() + dias);

      // Contas a pagar vencendo
      const contasPagar = await pool.query(
        `SELECT DISTINCT user_id FROM contas_pagar 
         WHERE status = 'pendente' AND data_vencimento = $1`,
        [dataAlerta.toISOString().split('T')[0]]
      );

      for (const conta of contasPagar.rows) {
        // Verificar se já existe alerta similar hoje
        const existeAlerta = await pool.query(
          `SELECT id FROM alertas 
           WHERE user_id = $1 AND tipo = 'vencimento' AND DATE(created_at) = CURRENT_DATE AND titulo LIKE $2`,
          [conta.user_id, `%vencendo em ${dias}%`]
        );

        if (existeAlerta.rows.length === 0) {
          await pool.query(
            `INSERT INTO alertas (user_id, tipo, titulo, mensagem)
             VALUES ($1, 'vencimento', $2, $3)`,
            [
              conta.user_id,
              dias === 0 ? 'Contas vencidas hoje' : `Contas vencendo em ${dias} dia(s)`,
              `Você tem contas a pagar vencendo em ${dias} dia(s)`
            ]
          );
        }
      }

      // Contas a receber vencendo
      const contasReceber = await pool.query(
        `SELECT DISTINCT user_id FROM contas_receber 
         WHERE status = 'pendente' AND data_vencimento = $1`,
        [dataAlerta.toISOString().split('T')[0]]
      );

      for (const conta of contasReceber.rows) {
        // Verificar se já existe alerta similar hoje
        const existeAlerta = await pool.query(
          `SELECT id FROM alertas 
           WHERE user_id = $1 AND tipo = 'vencimento' AND DATE(created_at) = CURRENT_DATE AND titulo LIKE $2`,
          [conta.user_id, `%vencendo em ${dias}%`]
        );

        if (existeAlerta.rows.length === 0) {
          await pool.query(
            `INSERT INTO alertas (user_id, tipo, titulo, mensagem)
             VALUES ($1, 'vencimento', $2, $3)`,
            [
              conta.user_id,
              dias === 0 ? 'Contas vencidas hoje' : `Contas vencendo em ${dias} dia(s)`,
              `Você tem contas a receber vencendo em ${dias} dia(s)`
            ]
          );
        }
      }
    }
  } catch (error) {
    console.error('Erro ao criar alertas:', error);
  }
}

export default router;

