import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../config/database.js';
import { executeSqlFile } from './sqlExecutor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  console.log('= Iniciando migra��o do banco de dados...\n');

  try {
    // Verificar conex�o com o banco
    await pool.query('SELECT NOW()');
    console.log(' Conex�o com o banco de dados estabelecida');

    // Ler arquivo SQL
    const sqlPath = join(__dirname, 'init.sql');
    console.log(`=� Lendo arquivo: ${sqlPath}`);
    const sql = readFileSync(sqlPath, 'utf8');

    // Executar SQL
    console.log('�  Executando migrations...');
    await executeSqlFile(sql);

    console.log('\n Migra��o conclu�da com sucesso!');
    console.log('\n=� Estrutura do banco criada:');
    console.log('   - Tabelas de RBAC (roles, users, refresh_tokens)');
    console.log('   - Tabelas de Auditoria (audit_logs)');
    console.log('   - Cadastros Base (motoristas, veiculos, clientes)');
    console.log('   - Viagens e OS (viagens, notas_fiscais)');
    console.log('   - Financeiro (contas_pagar, contas_receber)');
    console.log('   - Parcelas e Recorr�ncias');
    console.log('   - Caixa e Alertas');
    console.log('   - Views e �ndices');
    console.log('\n=d Usu�rio padr�o criado:');
    console.log('   Username: admin');
    console.log('   Senha: admin123');
    console.log('   �  IMPORTANTE: Altere a senha em produ��o!\n');

    process.exit(0);
  } catch (error) {
    console.error('\nL Erro ao executar migra��o:', error.message);
    console.error('\nDetalhes:', error);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n=� Dica: Verifique se o PostgreSQL est� rodando e as credenciais est�o corretas');
    } else if (error.code === '42P07') {
      console.error('\n=� Dica: As tabelas j� existem. Use "npm run db:reset" para recriar o banco');
    }

    process.exit(1);
  }
}

migrate();
