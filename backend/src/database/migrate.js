import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  console.log('= Iniciando migração do banco de dados...\n');

  try {
    // Verificar conexão com o banco
    await pool.query('SELECT NOW()');
    console.log(' Conexão com o banco de dados estabelecida');

    // Ler arquivo SQL
    const sqlPath = join(__dirname, 'init.sql');
    console.log(`=Ä Lendo arquivo: ${sqlPath}`);
    const sql = readFileSync(sqlPath, 'utf8');

    // Executar SQL
    console.log('™  Executando migrations...');
    await pool.query(sql);

    console.log('\n Migração concluída com sucesso!');
    console.log('\n=Ê Estrutura do banco criada:');
    console.log('   - Tabelas de RBAC (roles, users, refresh_tokens)');
    console.log('   - Tabelas de Auditoria (audit_logs)');
    console.log('   - Cadastros Base (motoristas, veiculos, clientes)');
    console.log('   - Viagens e OS (viagens, notas_fiscais)');
    console.log('   - Financeiro (contas_pagar, contas_receber)');
    console.log('   - Parcelas e Recorrências');
    console.log('   - Caixa e Alertas');
    console.log('   - Views e Índices');
    console.log('\n=d Usuário padrão criado:');
    console.log('   Username: admin');
    console.log('   Senha: admin123');
    console.log('      IMPORTANTE: Altere a senha em produção!\n');

    process.exit(0);
  } catch (error) {
    console.error('\nL Erro ao executar migração:', error.message);
    console.error('\nDetalhes:', error);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n=¡ Dica: Verifique se o PostgreSQL está rodando e as credenciais estão corretas');
    } else if (error.code === '42P07') {
      console.error('\n=¡ Dica: As tabelas já existem. Use "npm run db:reset" para recriar o banco');
    }

    process.exit(1);
  }
}

migrate();
