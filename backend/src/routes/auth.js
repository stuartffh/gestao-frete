import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/database.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sua_chave_refresh_super_segura';

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.password, u.role_id, r.name as role_name, r.permissions
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.username = $1 AND u.active = true`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const permissions = user.permissions ? JSON.parse(user.permissions) : [];
    
    // Access token (15 minutos)
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role_name },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Refresh token (7 dias)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    // Salvar refresh token no banco
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshToken, refreshTokenExpiry]
    );

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name,
        permissions,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Criar usuário (admin apenas)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email e senha são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username ou email já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, role_id, active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, username, email, role_id`,
      [username, email, hashedPassword, role_id || 2] // role_id 2 = user padrão
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.name as role_name, r.permissions
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.active = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    const permissions = user.permissions ? JSON.parse(user.permissions) : [];

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name,
        permissions,
      },
    });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    // Verificar refresh token no banco
    const result = await pool.query(
      `SELECT rt.user_id, rt.expires_at, u.active, r.name as role_name
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE rt.token = $1 AND rt.expires_at > NOW()`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }

    const tokenData = result.rows[0];

    if (!tokenData.active) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Gerar novo access token
    const accessToken = jwt.sign(
      { userId: tokenData.user_id, role: tokenData.role_name },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      accessToken,
    });
  } catch (error) {
    console.error('Erro ao refrescar token:', error);
    res.status(500).json({ error: 'Erro ao refrescar token' });
  }
});

// Logout (revogar refresh token)
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await pool.query(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [refreshToken]
      );
    }

    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
});

export default router;

