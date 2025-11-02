import cron from 'node-cron';
import { backupDatabase } from './backup.js';
import { criarAlertasVencimento } from '../routes/alertas.js';
import { processarRecorrencias } from '../routes/recorrencias.js';
import logger from '../config/logger.js';

// Backup diário às 2h da manhã
cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Iniciando backup diário...');
    await backupDatabase();
    logger.info('Backup diário concluído com sucesso');
  } catch (error) {
    logger.error('Erro no backup diário:', error);
  }
});

// Alertas diários às 8h
cron.schedule('0 8 * * *', async () => {
  try {
    logger.info('Criando alertas de vencimento...');
    await criarAlertasVencimento();
    logger.info('Alertas criados com sucesso');
  } catch (error) {
    logger.error('Erro ao criar alertas:', error);
  }
});

// Processar recorrências diariamente às 6h
cron.schedule('0 6 * * *', async () => {
  try {
    logger.info('Processando recorrências...');
    await processarRecorrencias();
    logger.info('Recorrências processadas com sucesso');
  } catch (error) {
    logger.error('Erro ao processar recorrências:', error);
  }
});

logger.info('Agendador de tarefas inicializado');

