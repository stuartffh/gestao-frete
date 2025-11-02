import client from './client';

export const getAlertas = async (params = {}) => {
  const response = await client.get('/alertas', { params });
  return response.data;
};

export const getAlertasNaoLidos = async () => {
  const response = await client.get('/alertas/nao-lidos');
  return response.data;
};

export const marcarAlertaLido = async (id) => {
  const response = await client.patch(`/alertas/${id}/lido`);
  return response.data;
};

