import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_NAME = process.env.DB_NAME || 'gestao_frete';
const DB_HOST = process.env.DB_HOST || 'localhost';

export async function backupDatabase() {
  try {
    const backupsDir = path.join(__dirname, '../../backups');
    await fs.mkdir(backupsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupFile = path.join(backupsDir, `backup-${timestamp}.sql`);

    // Usar PGPASSWORD para autenticação (funciona se pg_dump estiver disponível)
    // Alternativa: usar pg_dump via container ou fazer dump via SQL
    const env = { ...process.env, PGPASSWORD: DB_PASSWORD };
    
    // Tentar usar pg_dump se disponível, senão usar pg_dump via Docker
    let command;
    try {
      await execAsync('which pg_dump');
      command = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -F c -f "${backupFile}"`;
    } catch {
      // Se pg_dump não estiver disponível, tentar via Docker se estiver em container
      command = `docker exec gestao_frete_db pg_dump -U ${DB_USER} ${DB_NAME} > "${backupFile}"`;
    }

    await execAsync(command, { env });
    
    console.log(`Backup criado: ${backupFile}`);
    
    // Manter apenas os últimos 30 backups
    const files = await fs.readdir(backupsDir);
    const backupFiles = files
      .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 30) {
      for (const file of backupFiles.slice(30)) {
        await fs.unlink(path.join(backupsDir, file));
        console.log(`Backup antigo removido: ${file}`);
      }
    }

    return backupFile;
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    throw error;
  }
}

