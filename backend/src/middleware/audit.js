import { pool } from '../config/database.js';

export const auditLog = async (req, action, entity, entityId, before = null, after = null) => {
  try {
    const userId = req.user?.id || null;
    const beforeData = before ? JSON.stringify(before) : null;
    const afterData = after ? JSON.stringify(after) : null;

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, before_data, after_data, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        action, // CREATE, UPDATE, DELETE, VIEW, etc
        entity, // 'contas_pagar', 'clientes', etc
        entityId,
        beforeData,
        afterData,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'] || null
      ]
    );
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
    // Não quebrar o fluxo se audit falhar
  }
};

export const auditMiddleware = (action, getEntityInfo) => {
  return async (req, res, next) => {
    // Armazenar dados originais antes da modificação
    let beforeData = null;
    
    if (action === 'UPDATE' || action === 'DELETE') {
      try {
        const entityInfo = getEntityInfo(req);
        if (entityInfo.id) {
          // Buscar dados atuais
          const result = await pool.query(
            `SELECT * FROM ${entityInfo.table} WHERE id = $1`,
            [entityInfo.id]
          );
          if (result.rows.length > 0) {
            beforeData = result.rows[0];
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados antes:', error);
      }
    }

    // Interceptar resposta para pegar dados depois
    const originalJson = res.json;
    res.json = function(data) {
      // Registrar auditoria após operação
      const entityInfo = getEntityInfo(req);
      if (action === 'CREATE' || action === 'UPDATE') {
        const afterData = data.id ? data : (data.data?.id ? data.data : null);
        auditLog(req, action, entityInfo.entity, entityInfo.id || data.id || data.data?.id, beforeData, afterData);
      } else if (action === 'DELETE') {
        auditLog(req, action, entityInfo.entity, entityInfo.id, beforeData, null);
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

