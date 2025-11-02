import client from './client';

// Função genérica para cadastros
const createCadastroAPI = (entidade) => ({
  listar: async (params = {}) => {
    const response = await client.get(`/cadastros/${entidade}`, { params });
    return response.data;
  },
  buscar: async (id) => {
    const response = await client.get(`/cadastros/${entidade}/${id}`);
    return response.data;
  },
  criar: async (data) => {
    const response = await client.post(`/cadastros/${entidade}`, data);
    return response.data;
  },
  atualizar: async (id, data) => {
    const response = await client.put(`/cadastros/${entidade}/${id}`, data);
    return response.data;
  },
  deletar: async (id) => {
    const response = await client.delete(`/cadastros/${entidade}/${id}`);
    return response.data;
  },
  restaurar: async (id) => {
    const response = await client.post(`/cadastros/${entidade}/${id}/restore`);
    return response.data;
  },
});

export const clientes = createCadastroAPI('clientes');
export const fornecedores = createCadastroAPI('fornecedores');
export const veiculos = createCadastroAPI('veiculos');
export const motoristas = createCadastroAPI('motoristas');

