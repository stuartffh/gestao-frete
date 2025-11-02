import client from './client';

// Contas a Pagar
export const getContasPagar = async (params = {}) => {
  const response = await client.get('/contas-pagar', { params });
  return response.data;
};

export const getContaPagar = async (id) => {
  const response = await client.get(`/contas-pagar/${id}`);
  return response.data;
};

export const createContaPagar = async (data) => {
  const response = await client.post('/contas-pagar', data);
  return response.data;
};

export const updateContaPagar = async (id, data) => {
  const response = await client.put(`/contas-pagar/${id}`, data);
  return response.data;
};

export const deleteContaPagar = async (id) => {
  const response = await client.delete(`/contas-pagar/${id}`);
  return response.data;
};

export const marcarComoPaga = async (id, data = {}) => {
  const response = await client.patch(`/contas-pagar/${id}/pagar`, data);
  return response.data;
};

// Contas a Receber
export const getContasReceber = async (params = {}) => {
  const response = await client.get('/contas-receber', { params });
  return response.data;
};

export const getContaReceber = async (id) => {
  const response = await client.get(`/contas-receber/${id}`);
  return response.data;
};

export const createContaReceber = async (data) => {
  const response = await client.post('/contas-receber', data);
  return response.data;
};

export const updateContaReceber = async (id, data) => {
  const response = await client.put(`/contas-receber/${id}`, data);
  return response.data;
};

export const deleteContaReceber = async (id) => {
  const response = await client.delete(`/contas-receber/${id}`);
  return response.data;
};

export const marcarComoRecebida = async (id, data = {}) => {
  const response = await client.patch(`/contas-receber/${id}/receber`, data);
  return response.data;
};

// Pagamentos
export const getPagamentos = async (params = {}) => {
  const response = await client.get('/pagamentos', { params });
  return response.data;
};

export const getPagamento = async (id) => {
  const response = await client.get(`/pagamentos/${id}`);
  return response.data;
};

export const createPagamento = async (data) => {
  const response = await client.post('/pagamentos', data);
  return response.data;
};

export const updatePagamento = async (id, data) => {
  const response = await client.put(`/pagamentos/${id}`, data);
  return response.data;
};

export const deletePagamento = async (id) => {
  const response = await client.delete(`/pagamentos/${id}`);
  return response.data;
};

// Comprovantes
export const uploadComprovantePagar = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/comprovantes/contas-pagar/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload do comprovante');
  }

  return response.json();
};

export const uploadComprovanteReceber = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/comprovantes/contas-receber/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload do comprovante');
  }

  return response.json();
};

export const uploadComprovantePagamento = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/comprovantes/pagamentos/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload do comprovante');
  }

  return response.json();
};

// Relatórios Financeiro
export const getRelatorioFluxoCaixa = async (dataInicio, dataFim) => {
  const response = await client.get('/relatorios-financeiro/fluxo-caixa', {
    params: { dataInicio, dataFim },
  });
  return response.data;
};

export const getRelatorioCategoria = async (tipo, dataInicio, dataFim) => {
  const response = await client.get('/relatorios-financeiro/categoria', {
    params: { tipo, dataInicio, dataFim },
  });
  return response.data;
};

export const exportarCSV = async (tipo, dataInicio, dataFim) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const url = `${API_URL}/api/relatorios-financeiro/exportar/csv?tipo=${tipo}&dataInicio=${dataInicio}&dataFim=${dataFim}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao exportar CSV');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${tipo}_${dataInicio}_${dataFim}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportarXLSX = async (tipo, dataInicio, dataFim) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const url = `${API_URL}/api/relatorios-financeiro/exportar/xlsx?tipo=${tipo}&dataInicio=${dataInicio}&dataFim=${dataFim}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao exportar XLSX');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${tipo}_${dataInicio}_${dataFim}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportarPDF = async (tipo, dataInicio, dataFim) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const url = `${API_URL}/api/relatorios-financeiro/exportar/pdf?tipo=${tipo}&dataInicio=${dataInicio}&dataFim=${dataFim}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao exportar PDF');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${tipo}_${dataInicio}_${dataFim}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

