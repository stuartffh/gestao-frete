import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Verifica se o banco está inicializado e executa migração se necessário
 * @returns {Promise<boolean>} true se migração foi executada, false se já estava inicializado
 */
export async function checkAndMigrate() {
  try {
    // Verificar se a tabela 'users' existe
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as table_exists;
    `);

    const tableExists = result.rows[0].table_exists;

    if (!tableExists) {
      console.log('= Banco de dados vazio detectado. Executando migração inicial...\n');

      // Ler e executar init.sql
      const sqlPath = join(__dirname, 'init.sql');
      const sql = readFileSync(sqlPath, 'utf8');
      await pool.query(sql);

      console.log(' Banco de dados inicializado com sucesso!');
      console.log('=d Usuário padrão criado: admin / admin123');
      console.log('   IMPORTANTE: Altere a senha padrão!\n');

      return true;
    }

    console.log(' Banco de dados já inicializado');
    return false;

  } catch (error) {
    console.error('L Erro ao verificar/migrar banco de dados:', error.message);
    throw error;
  }
}
