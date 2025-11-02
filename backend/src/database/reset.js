import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../config/database.js';
import { executeSqlFile } from './sqlExecutor.js';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function askConfirmation() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('�  ATEN��O: Isso ir� APAGAR TODOS OS DADOS do banco! Confirma? (sim/n�o): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'sim');
    });
  });
}

async function reset() {
  console.log('= Reset do Banco de Dados\n');

  // Confirmar a��o em produ��o
  if (process.env.NODE_ENV === 'production') {
    const confirmed = await askConfirmation();
    if (!confirmed) {
      console.log('L Opera��o cancelada pelo usu�rio');
      process.exit(0);
    }
  }

  try {
    // Verificar conex�o
    await pool.query('SELECT NOW()');
    console.log(' Conex�o estabelecida');

    // Drop de todas as tabelas
    console.log('\n=�  Removendo tabelas existentes...');
    await pool.query(`
      DROP TABLE IF EXISTS alertas CASCADE;
      DROP TABLE IF EXISTS caixa CASCADE;
      DROP TABLE IF EXISTS recorrencias CASCADE;
      DROP TABLE IF EXISTS parcelas CASCADE;
      DROP TABLE IF EXISTS contas_receber CASCADE;
      DROP TABLE IF EXISTS contas_pagar CASCADE;
      DROP TABLE IF EXISTS notas_fiscais CASCADE;
      DROP TABLE IF EXISTS viagens CASCADE;
      DROP TABLE IF EXISTS clientes CASCADE;
      DROP TABLE IF EXISTS veiculos CASCADE;
      DROP TABLE IF EXISTS motoristas CASCADE;
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS refresh_tokens CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS roles CASCADE;

      DROP VIEW IF EXISTS vw_viagens_completas CASCADE;
      DROP VIEW IF EXISTS vw_contas_pagar_pendentes CASCADE;
      DROP VIEW IF EXISTS vw_contas_receber_pendentes CASCADE;

      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `);
    console.log(' Tabelas removidas');

    // Executar init.sql
    console.log('\n=( Recriando estrutura do banco...');
    const sqlPath = join(__dirname, 'init.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    await executeSqlFile(sql);

    console.log('\n Banco de dados resetado com sucesso!');
    console.log('\n=d Usu�rio padr�o recriado:');
    console.log('   Username: admin');
    console.log('   Senha: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('\nL Erro ao resetar banco:', error.message);
    console.error(error);
    process.exit(1);
  }
}

reset();
