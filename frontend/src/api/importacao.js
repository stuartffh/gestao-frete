import client from './client';

export const importarClientes = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/importacao/clientes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao importar clientes');
  }

  return response.json();
};

export const importarFornecedores = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/importacao/fornecedores`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao importar fornecedores');
  }

  return response.json();
};

export const importarContas = async (file, tipo) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/importacao/contas`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao importar contas');
  }

  return response.json();
};

// Conciliação
export const processarExtrato = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/conciliacao/extrato`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao processar extrato');
  }

  return response.json();
};

export const confirmarMatch = async (data) => {
  const response = await client.post('/conciliacao/confirmar-match', data);
  return response.data;
};

