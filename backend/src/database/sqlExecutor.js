import { pool } from '../config/database.js';

/**
 * Executa múltiplas declarações SQL de um arquivo de forma robusta
 * Lida corretamente com blocos DO $$ e outras estruturas complexas
 */
export async function executeSqlFile(sqlContent) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Dividir SQL em declarações, tratando blocos DO $$ corretamente
    const statements = parseSqlStatements(sqlContent);
    
    // Executar cada declaração
    for (const statement of statements) {
      if (statement.trim().length > 0) {
        try {
          await client.query(statement);
        } catch (err) {
          // Ignorar erros de "já existe" e "não existe" para objetos que podem ser criados múltiplas vezes
          if (err.code === '42P07' || err.code === '42710' || err.code === '42P01') {
            // Tabela/view/índice já existe ou não existe (para DROP)
            continue;
          }
          // Re-throw outros erros
          throw err;
        }
      }
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Parse SQL content em declarações individuais
 * Trata corretamente blocos DO $$ ... END $$; e outras estruturas
 */
function parseSqlStatements(sqlContent) {
  const statements = [];
  let currentStatement = '';
  let inDoBlock = false;
  let dollarTag = '';
  let i = 0;
  
  // Remover comentários de linha (-- até o final da linha) mas preservar estrutura
  const lines = sqlContent.split('\n');
  const cleanedLines = lines.map(line => {
    const commentIndex = line.indexOf('--');
    if (commentIndex >= 0 && !line.substring(0, commentIndex).includes("'")) {
      return line.substring(0, commentIndex);
    }
    return line;
  });
  sqlContent = cleanedLines.join('\n');
  
  while (i < sqlContent.length) {
    const char = sqlContent[i];
    const remaining = sqlContent.substring(i);
    
    // Detectar início de bloco DO $$
    if (!inDoBlock) {
      const doMatch = remaining.match(/^DO\s+(\$\w*\$)/i);
      if (doMatch) {
        inDoBlock = true;
        dollarTag = doMatch[1];
        currentStatement += doMatch[0];
        i += doMatch[0].length;
        continue;
      }
    }
    
    // Se estiver em bloco DO, procurar pelo fim (END $$tag$$;)
    if (inDoBlock) {
      // Verificar se encontramos END seguido do dollarTag e ponto-e-vírgula
      // Permitir espaços em branco antes do END
      const endPattern = new RegExp(`\\s*END\\s+${dollarTag.replace(/\$/g, '\\$')}\\s*;`, 'i');
      const match = remaining.match(endPattern);
      
      if (match && match.index === 0) {
        // Encontramos o fim do bloco exatamente na posição atual (com espaços antes se houver)
        currentStatement += match[0];
        inDoBlock = false;
        dollarTag = '';
        statements.push(currentStatement.trim());
        currentStatement = '';
        i += match[0].length;
        continue;
      }
      
      currentStatement += char;
      i++;
      continue;
    }
    
    // Para declarações normais, usar ; como delimitador
    if (char === ';') {
      const stmt = currentStatement.trim();
      if (stmt.length > 0 && !stmt.match(/^[\s\n]*$/)) {
        statements.push(stmt);
      }
      currentStatement = '';
      i++;
      continue;
    }
    
    currentStatement += char;
    i++;
  }
  
  // Adicionar última declaração se houver
  const lastStmt = currentStatement.trim();
  if (lastStmt.length > 0 && !lastStmt.match(/^[\s\n]*$/)) {
    statements.push(lastStmt);
  }
  
  return statements.filter(stmt => stmt.length > 0);
}

