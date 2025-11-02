import client from './client';

export const getRelatorioPeriodo = async (dataInicio, dataFim, tipo = 'mensal') => {
  const response = await client.get('/relatorios/periodo', {
    params: { dataInicio, dataFim, tipo },
  });
  return response.data;
};

export const getRelatorioStatus = async (dataInicio, dataFim) => {
  const response = await client.get('/relatorios/status', {
    params: { dataInicio, dataFim },
  });
  return response.data;
};

export const getRelatorioEmitentes = async (dataInicio, dataFim, limit = 10) => {
  const response = await client.get('/relatorios/emitentes', {
    params: { dataInicio, dataFim, limit },
  });
  return response.data;
};

export const getRelatorioDesempenho = async (dataInicio, dataFim) => {
  const response = await client.get('/relatorios/desempenho', {
    params: { dataInicio, dataFim },
  });
  return response.data;
};

export const exportarRelatorio = async (dataInicio, dataFim) => {
  const response = await client.get('/relatorios/exportar', {
    params: { dataInicio, dataFim, formato: 'csv' },
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `relatorio_notas_${dataInicio}_${dataFim}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

