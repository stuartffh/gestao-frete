import express from 'express';
import fileUpload from 'express-fileupload';
import { pool } from '../config/database.js';
import { authenticateToken, hasPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { promises as fs } from 'fs';

const router = express.Router();
router.use(authenticateToken);

// Importar CSV de clientes
router.post('/clientes', hasPermission('importacao:importar'), async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Arquivo CSV requerido' });
    }

    const file = req.files.file;
    const csvContent = file.data.toString('utf-8');
    const lines = csvContent.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    const clientes = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const cliente = {
        nome: values[0] || '',
        cpf_cnpj: values[1] || '',
        email: values[2] || '',
        telefone: values[3] || '',
        endereco: values[4] || '',
        cidade: values[5] || '',
        estado: values[6] || '',
        cep: values[7] || '',
      };

      if (cliente.nome) {
        const result = await pool.query(
          `INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (cpf_cnpj) DO NOTHING
           RETURNING *`,
          [cliente.nome, cliente.cpf_cnpj, cliente.email, cliente.telefone, cliente.endereco, cliente.cidade, cliente.estado, cliente.cep, req.user.id]
        );
        if (result.rows.length > 0) {
          clientes.push(result.rows[0]);
        }
      }
    }

    await auditLog(req, 'IMPORT', 'clientes', null, null, { quantidade: clientes.length });
    res.json({ message: `${clientes.length} clientes importados com sucesso`, clientes });
  } catch (error) {
    console.error('Erro ao importar clientes:', error);
    res.status(500).json({ error: 'Erro ao importar clientes' });
  }
});

// Importar CSV de fornecedores
router.post('/fornecedores', hasPermission('importacao:importar'), async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Arquivo CSV requerido' });
    }

    const file = req.files.file;
    const csvContent = file.data.toString('utf-8');
    const lines = csvContent.split('\n').filter(l => l.trim());

    const fornecedores = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const fornecedor = {
        nome: values[0] || '',
        cpf_cnpj: values[1] || '',
        email: values[2] || '',
        telefone: values[3] || '',
      };

      if (fornecedor.nome) {
        const result = await pool.query(
          `INSERT INTO fornecedores (nome, cpf_cnpj, email, telefone, user_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (cpf_cnpj) DO NOTHING
           RETURNING *`,
          [fornecedor.nome, fornecedor.cpf_cnpj, fornecedor.email, fornecedor.telefone, req.user.id]
        );
        if (result.rows.length > 0) {
          fornecedores.push(result.rows[0]);
        }
      }
    }

    await auditLog(req, 'IMPORT', 'fornecedores', null, null, { quantidade: fornecedores.length });
    res.json({ message: `${fornecedores.length} fornecedores importados com sucesso`, fornecedores });
  } catch (error) {
    console.error('Erro ao importar fornecedores:', error);
    res.status(500).json({ error: 'Erro ao importar fornecedores' });
  }
});

// Importar contas via CSV
router.post('/contas', hasPermission('importacao:importar'), async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Arquivo CSV requerido' });
    }

    const { tipo } = req.body; // 'pagar' ou 'receber'
    if (!tipo) {
      return res.status(400).json({ error: 'Tipo requerido: pagar ou receber' });
    }

    const file = req.files.file;
    const csvContent = file.data.toString('utf-8');
    const lines = csvContent.split('\n').filter(l => l.trim());

    const contas = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (tipo === 'pagar') {
        const result = await pool.query(
          `INSERT INTO contas_pagar (descricao, valor, data_vencimento, categoria, fornecedor, status, user_id)
           VALUES ($1, $2, $3, $4, $5, 'pendente', $6)
           RETURNING *`,
          [values[0], values[1], values[2], values[3], values[4], req.user.id]
        );
        contas.push(result.rows[0]);
      } else {
        const result = await pool.query(
          `INSERT INTO contas_receber (descricao, valor, data_vencimento, categoria, cliente, status, user_id)
           VALUES ($1, $2, $3, $4, $5, 'pendente', $6)
           RETURNING *`,
          [values[0], values[1], values[2], values[3], values[4], req.user.id]
        );
        contas.push(result.rows[0]);
      }
    }

    await auditLog(req, 'IMPORT', `contas_${tipo}`, null, null, { quantidade: contas.length });
    res.json({ message: `${contas.length} contas importadas com sucesso`, contas });
  } catch (error) {
    console.error('Erro ao importar contas:', error);
    res.status(500).json({ error: 'Erro ao importar contas' });
  }
});

export default router;

