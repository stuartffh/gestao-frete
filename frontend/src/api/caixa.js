import client from './client';

export const abrirCaixa = async (data) => {
  const response = await client.post('/caixa/abrir', data);
  return response.data;
};

export const fecharCaixa = async (id, data = {}) => {
  const response = await client.post(`/caixa/fechar/${id}`, data);
  return response.data;
};

export const fechamentoMensal = async (data) => {
  const response = await client.post('/caixa/fechamento-mensal', data);
  return response.data;
};

export const verificarFechamento = async (mes, ano) => {
  const response = await client.get(`/caixa/fechamento-mensal/verificar/${mes}/${ano}`);
  return response.data;
};

export const downloadRelatorioPDF = async (mes, ano) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/caixa/fechamento-mensal/relatorio-pdf/${mes}/${ano}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao baixar relatório PDF');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `fechamento_${mes}_${ano}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

