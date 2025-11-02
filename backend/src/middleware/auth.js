import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário no banco
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.name as role_name, r.permissions
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.active = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    req.user = result.rows[0];
    req.user.permissions = req.user.permissions ? JSON.parse(req.user.permissions) : [];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expirado' });
    }
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (allowedRoles.includes(req.user.role_name)) {
      return next();
    }

    return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });
  };
};

export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (req.user.permissions.includes(permission) || req.user.role_name === 'admin') {
      return next();
    }

    return res.status(403).json({ error: `Acesso negado: permissão '${permission}' requerida` });
  };
};

