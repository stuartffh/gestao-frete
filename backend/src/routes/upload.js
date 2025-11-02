import express from 'express';
import fileUpload from 'express-fileupload';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, '../../uploads');
const pdfsDir = path.join(uploadsDir, 'pdfs');
const fotosDir = path.join(uploadsDir, 'fotos');

async function ensureDirectories() {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(pdfsDir, { recursive: true });
  await fs.mkdir(fotosDir, { recursive: true });
}

ensureDirectories();

// Upload de PDF
router.post('/pdf/:notaId', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.files.file;
    const { notaId } = req.params;

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Arquivo deve ser um PDF' });
    }

    const fileName = `nota_${notaId}_${Date.now()}.pdf`;
    const filePath = path.join(pdfsDir, fileName);

    await file.mv(filePath);

    // Atualizar banco de dados
    await pool.query(
      'UPDATE notas_fiscais SET pdf_path = $1 WHERE id = $2',
      [`/uploads/pdfs/${fileName}`, notaId]
    );

    res.json({
      message: 'PDF uploadado com sucesso',
      path: `/uploads/pdfs/${fileName}`
    });
  } catch (error) {
    console.error('Erro no upload de PDF:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do PDF' });
  }
});

// Upload de foto
router.post('/foto/:notaId', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.files.file;
    const { notaId } = req.params;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Arquivo deve ser uma imagem (JPEG, PNG ou WebP)' });
    }

    const ext = path.extname(file.name);
    const fileName = `nota_${notaId}_${Date.now()}${ext}`;
    const filePath = path.join(fotosDir, fileName);

    await file.mv(filePath);

    // Atualizar banco de dados
    await pool.query(
      'UPDATE notas_fiscais SET foto_path = $1 WHERE id = $2',
      [`/uploads/fotos/${fileName}`, notaId]
    );

    res.json({
      message: 'Foto uploadada com sucesso',
      path: `/uploads/fotos/${fileName}`
    });
  } catch (error) {
    console.error('Erro no upload de foto:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da foto' });
  }
});

export default router;

