import client from './client';

export const getViagens = async (params = {}) => {
  const response = await client.get('/viagens', { params });
  return response.data;
};

export const getViagem = async (id) => {
  const response = await client.get(`/viagens/${id}`);
  return response.data;
};

export const createViagem = async (data) => {
  const response = await client.post('/viagens', data);
  return response.data;
};

export const updateViagem = async (id, data) => {
  const response = await client.patch(`/viagens/${id}`, data);
  return response.data;
};

export const encerrarViagem = async (id, data) => {
  const response = await client.patch(`/viagens/${id}/encerrar`, data);
  return response.data;
};

export const getViagemRelatorio = async (id) => {
  const response = await client.get(`/viagens/${id}/relatorio`);
  return response.data;
};

export const adicionarDespesa = async (viagemId, data) => {
  const response = await client.post(`/viagens/${viagemId}/despesas`, data);
  return response.data;
};

export const getDespesas = async (viagemId) => {
  const response = await client.get(`/viagens/${viagemId}/despesas`);
  return response.data;
};

export const adicionarChecklist = async (viagemId, data) => {
  const response = await client.post(`/viagens/${viagemId}/checklist`, data);
  return response.data;
};

export const getChecklist = async (viagemId) => {
  const response = await client.get(`/viagens/${viagemId}/checklist`);
  return response.data;
};

export const atualizarChecklist = async (id, data) => {
  const response = await client.patch(`/viagens/checklist/${id}`, data);
  return response.data;
};

