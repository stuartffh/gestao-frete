import { authorize } from './auth.js';

// Middleware por rota com papéis específicos
export const requireAdmin = authorize('admin');
export const requireFinanceiro = authorize('financeiro', 'admin');
export const requireOperador = authorize('operador', 'financeiro', 'admin');
export const requireLeitor = authorize('leitor', 'operador', 'financeiro', 'admin');

// Middleware para múltiplos papéis
export const requireRoles = (...roles) => authorize(...roles);

