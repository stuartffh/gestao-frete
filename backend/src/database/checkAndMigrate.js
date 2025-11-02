import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../config/database.js';
import { executeSqlFile } from './sqlExecutor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Verifica se o banco est� inicializado e executa migra��o se necess�rio
 * @returns {Promise<boolean>} true se migra��o foi executada, false se j� estava inicializado
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
      console.log('= Banco de dados vazio detectado. Executando migra��o inicial...\n');

      // Ler e executar init.sql
      const sqlPath = join(__dirname, 'init.sql');
      const sql = readFileSync(sqlPath, 'utf8');
      await executeSqlFile(sql);

      console.log(' Banco de dados inicializado com sucesso!');
      console.log('=d Usu�rio padr�o criado: admin / admin123');
      console.log('�  IMPORTANTE: Altere a senha padr�o!\n');

      return true;
    }

    console.log(' Banco de dados j� inicializado');
    return false;

  } catch (error) {
    console.error('L Erro ao verificar/migrar banco de dados:', error.message);
    throw error;
  }
}
