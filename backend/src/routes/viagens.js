import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();
router.use(authenticateToken);

// Listar viagens
router.get('/', async (req, res) => {
  try {
    const { status, cliente_id, page = 1, limit = 20 } = req.query;
    let query = 'SELECT v.*, c.nome as cliente_nome FROM viagens v LEFT JOIN clientes c ON v.cliente_id = c.id WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND v.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    if (cliente_id) {
      query += ` AND v.cliente_id = $${paramCount}`;
      params.push(cliente_id);
      paramCount++;
    }

    query += ' ORDER BY v.created_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, ''), params.slice(0, -2));
    
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
    console.error('Erro ao listar viagens:', error);
    res.status(500).json({ error: 'Erro ao listar viagens' });
  }
});

// Criar viagem
router.post('/', hasPermission('viagens:criar'), async (req, res) => {
  try {
    const { origem, destino, cliente_id, veiculo_id, motorista_id, km_previsto, data_saida, observacoes } = req.body;
    const result = await pool.query(
      `INSERT INTO viagens (origem, destino, cliente_id, veiculo_id, motorista_id, km_previsto, data_saida, status, observacoes, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'aberta', $8, $9) RETURNING *`,
      [origem, destino, cliente_id, veiculo_id, motorista_id, km_previsto, data_saida, observacoes, req.user.id]
    );
    await auditLog(req, 'CREATE', 'viagens', result.rows[0].id, null, result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    res.status(500).json({ error: 'Erro ao criar viagem' });
  }
});

// Atualizar viagem (genérico - para Kanban e outros)
router.patch('/:id', hasPermission('viagens:editar'), async (req, res) => {
  try {
    const { id } = req.params;
    const before = await pool.query('SELECT * FROM viagens WHERE id = $1', [id]);

    if (before.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    const { status, origem, destino, cliente_id, veiculo_id, motorista_id, km_previsto, data_saida, observacoes } = req.body;

    let query = 'UPDATE viagens SET updated_at = CURRENT_TIMESTAMP';
    const params = [];
    let paramCount = 1;

    if (status !== undefined) {
      query += `, status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    if (origem !== undefined) {
      query += `, origem = $${paramCount}`;
      params.push(origem);
      paramCount++;
    }
    if (destino !== undefined) {
      query += `, destino = $${paramCount}`;
      params.push(destino);
      paramCount++;
    }
    if (cliente_id !== undefined) {
      query += `, cliente_id = $${paramCount}`;
      params.push(cliente_id);
      paramCount++;
    }
    if (veiculo_id !== undefined) {
      query += `, veiculo_id = $${paramCount}`;
      params.push(veiculo_id);
      paramCount++;
    }
    if (motorista_id !== undefined) {
      query += `, motorista_id = $${paramCount}`;
      params.push(motorista_id);
      paramCount++;
    }
    if (km_previsto !== undefined) {
      query += `, km_previsto = $${paramCount}`;
      params.push(km_previsto);
      paramCount++;
    }
    if (data_saida !== undefined) {
      query += `, data_saida = $${paramCount}`;
      params.push(data_saida);
      paramCount++;
    }
    if (observacoes !== undefined) {
      query += `, observacoes = $${paramCount}`;
      params.push(observacoes);
      paramCount++;
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);
    await auditLog(req, 'UPDATE', 'viagens', id, before.rows[0], result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar viagem:', error);
    res.status(500).json({ error: 'Erro ao atualizar viagem' });
  }
});

// Encerrar viagem
router.patch('/:id/encerrar', hasPermission('viagens:encerrar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { km_real, data_chegada, observacoes } = req.body;
    
    // Calcular custos
    const despesas = await pool.query('SELECT SUM(valor) as total FROM viagem_despesas WHERE viagem_id = $1', [id]);
    const custoTotal = parseFloat(despesas.rows[0].total || 0);
    const custoPorKm = km_real > 0 ? custoTotal / km_real : 0;

    const result = await pool.query(
      `UPDATE viagens SET 
        status = 'encerrada', km_real = $1, data_chegada = $2, custo_total = $3, custo_por_km = $4, observacoes = COALESCE($5, observacoes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [km_real, data_chegada, custoTotal, custoPorKm, observacoes, id]
    );

    await auditLog(req, 'UPDATE', 'viagens', id, null, result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao encerrar viagem:', error);
    res.status(500).json({ error: 'Erro ao encerrar viagem' });
  }
});

// Vincular despesa à viagem
router.post('/:id/despesas', hasPermission('viagens:editar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, categoria, data, comprovante_path } = req.body;

    const result = await pool.query(
      `INSERT INTO viagem_despesas (viagem_id, descricao, valor, categoria, data, comprovante_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, descricao, valor, categoria, data || new Date().toISOString().split('T')[0], comprovante_path]
    );

    await auditLog(req, 'CREATE', 'viagem_despesas', result.rows[0].id, null, result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao vincular despesa:', error);
    res.status(500).json({ error: 'Erro ao vincular despesa' });
  }
});

// Adicionar item ao checklist
router.post('/:id/checklist', hasPermission('viagens:editar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { item, observacoes } = req.body;

    const result = await pool.query(
      `INSERT INTO viagem_checklist (viagem_id, item, observacoes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, item, observacoes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar checklist:', error);
    res.status(500).json({ error: 'Erro ao adicionar checklist' });
  }
});

// Atualizar item do checklist
router.patch('/checklist/:id', hasPermission('viagens:editar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { concluido, observacoes } = req.body;

    const result = await pool.query(
      `UPDATE viagem_checklist SET concluido = COALESCE($1, concluido), observacoes = COALESCE($2, observacoes)
       WHERE id = $3 RETURNING *`,
      [concluido, observacoes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item do checklist não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar checklist:', error);
    res.status(500).json({ error: 'Erro ao atualizar checklist' });
  }
});

// Listar despesas da viagem
router.get('/:id/despesas', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM viagem_despesas WHERE viagem_id = $1 ORDER BY data DESC', [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar despesas:', error);
    res.status(500).json({ error: 'Erro ao listar despesas' });
  }
});

// Listar checklist da viagem
router.get('/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM viagem_checklist WHERE viagem_id = $1 ORDER BY created_at ASC', [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar checklist:', error);
    res.status(500).json({ error: 'Erro ao listar checklist' });
  }
});

// Relatório por viagem
router.get('/:id/relatorio', async (req, res) => {
  try {
    const { id } = req.params;
    const viagem = await pool.query('SELECT * FROM viagens WHERE id = $1', [id]);
    const despesas = await pool.query('SELECT * FROM viagem_despesas WHERE viagem_id = $1', [id]);
    const checklist = await pool.query('SELECT * FROM viagem_checklist WHERE viagem_id = $1', [id]);
    
    res.json({
      viagem: viagem.rows[0],
      despesas: despesas.rows,
      checklist: checklist.rows,
      totalDespesas: despesas.rows.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0),
      custoPorKm: viagem.rows[0]?.km_real > 0 
        ? (despesas.rows.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0) / viagem.rows[0].km_real).toFixed(2)
        : 0,
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

export default router;

