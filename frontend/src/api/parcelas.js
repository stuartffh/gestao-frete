import client from './client';

export const getParcelas = async (params = {}) => {
  const response = await client.get('/parcelas', { params });
  return response.data;
};

export const gerarParcelas = async (data) => {
  const response = await client.post('/parcelas/gerar', data);
  return response.data;
};

export const marcarParcelaPaga = async (id, data = {}) => {
  const response = await client.patch(`/parcelas/${id}/pagar`, data);
  return response.data;
};

export const deleteParcelas = async (contaId, contaTipo) => {
  const response = await client.delete(`/parcelas/conta/${contaId}/${contaTipo}`);
  return response.data;
};

// Recorrências
export const getRecorrencias = async (params = {}) => {
  const response = await client.get('/recorrencias', { params });
  return response.data;
};

export const createRecorrencia = async (data) => {
  const response = await client.post('/recorrencias', data);
  return response.data;
};

export const getProximasParcelas = async (limite = 30) => {
  const response = await client.get('/recorrencias/proximas', { params: { limite } });
  return response.data;
};

export const cancelarRecorrencia = async (id) => {
  const response = await client.patch(`/recorrencias/${id}/cancelar`);
  return response.data;
};

