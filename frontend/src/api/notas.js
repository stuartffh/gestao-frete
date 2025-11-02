import client from './client';

export const getNotas = async (params = {}) => {
  const response = await client.get('/notas', { params });
  return response.data;
};

export const getNota = async (id) => {
  const response = await client.get(`/notas/${id}`);
  return response.data;
};

export const createNota = async (data) => {
  const response = await client.post('/notas', data);
  return response.data;
};

export const updateNota = async (id, data) => {
  const response = await client.put(`/notas/${id}`, data);
  return response.data;
};

export const deleteNota = async (id) => {
  const response = await client.delete(`/notas/${id}`);
  return response.data;
};

export const uploadPDF = async (notaId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${API_URL}/api/upload/pdf/${notaId}`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Erro ao fazer upload do PDF');
  }
  return response.json();
};

export const uploadFoto = async (notaId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${API_URL}/api/upload/foto/${notaId}`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Erro ao fazer upload da foto');
  }
  return response.json();
};

