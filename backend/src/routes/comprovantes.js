import express from 'express';
import fileUpload from 'express-fileupload';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(authenticateToken);

// Criar diretórios
const uploadsDir = path.join(__dirname, '../../uploads');
const comprovantesDir = path.join(uploadsDir, 'comprovantes');

async function ensureDirectories() {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(comprovantesDir, { recursive: true });
}

ensureDirectories();

// Upload de comprovante para conta a pagar
router.post('/contas-pagar/:id', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.files.file;
    const { id } = req.params;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
    }

    const ext = path.extname(file.name) || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
    const fileName = `comprovante_pagar_${id}_${Date.now()}${ext}`;
    const filePath = path.join(comprovantesDir, fileName);

    await file.mv(filePath);

    await pool.query(
      'UPDATE contas_pagar SET comprovante_path = $1 WHERE id = $2',
      [`/uploads/comprovantes/${fileName}`, id]
    );

    res.json({
      message: 'Comprovante uploadado com sucesso',
      path: `/uploads/comprovantes/${fileName}`
    });
  } catch (error) {
    console.error('Erro no upload de comprovante:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do comprovante' });
  }
});

// Upload de comprovante para conta a receber
router.post('/contas-receber/:id', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.files.file;
    const { id } = req.params;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
    }

    const ext = path.extname(file.name) || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
    const fileName = `comprovante_receber_${id}_${Date.now()}${ext}`;
    const filePath = path.join(comprovantesDir, fileName);

    await file.mv(filePath);

    await pool.query(
      'UPDATE contas_receber SET comprovante_path = $1 WHERE id = $2',
      [`/uploads/comprovantes/${fileName}`, id]
    );

    res.json({
      message: 'Comprovante uploadado com sucesso',
      path: `/uploads/comprovantes/${fileName}`
    });
  } catch (error) {
    console.error('Erro no upload de comprovante:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do comprovante' });
  }
});

// Upload de comprovante para pagamento
router.post('/pagamentos/:id', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.files.file;
    const { id } = req.params;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
    }

    const ext = path.extname(file.name) || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
    const fileName = `comprovante_pagamento_${id}_${Date.now()}${ext}`;
    const filePath = path.join(comprovantesDir, fileName);

    await file.mv(filePath);

    await pool.query(
      'UPDATE pagamentos SET comprovante_path = $1 WHERE id = $2',
      [`/uploads/comprovantes/${fileName}`, id]
    );

    res.json({
      message: 'Comprovante uploadado com sucesso',
      path: `/uploads/comprovantes/${fileName}`
    });
  } catch (error) {
    console.error('Erro no upload de comprovante:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do comprovante' });
  }
});

export default router;

