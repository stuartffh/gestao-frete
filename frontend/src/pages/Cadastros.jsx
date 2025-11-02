import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { clientes, fornecedores, veiculos, motoristas } from '../api/cadastros';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { LoadingPage } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { useToastContext } from '../components/Toaster';
import ConfirmModal from '../components/ui/ConfirmModal';
import { maskCPF, maskCNPJ, maskPhone } from '../lib/utils';

const ENTIDADES = {
  clientes: {
    nome: 'Clientes',
    api: clientes,
    campos: ['nome', 'cpf_cnpj', 'email', 'telefone'],
    camposForm: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'cpf_cnpj', label: 'CPF/CNPJ', type: 'text', required: true, mask: true },
      { name: 'email', label: 'Email', type: 'email', required: false },
      { name: 'telefone', label: 'Telefone', type: 'text', required: false, mask: 'phone' },
      { name: 'endereco', label: 'Endereço', type: 'text', required: false },
      { name: 'cidade', label: 'Cidade', type: 'text', required: false },
      { name: 'estado', label: 'Estado', type: 'text', required: false },
      { name: 'cep', label: 'CEP', type: 'text', required: false },
    ],
  },
  fornecedores: {
    nome: 'Fornecedores',
    api: fornecedores,
    campos: ['nome', 'cpf_cnpj', 'email', 'telefone'],
    camposForm: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'cpf_cnpj', label: 'CPF/CNPJ', type: 'text', required: true, mask: true },
      { name: 'email', label: 'Email', type: 'email', required: false },
      { name: 'telefone', label: 'Telefone', type: 'text', required: false, mask: 'phone' },
    ],
  },
  veiculos: {
    nome: 'Veículos',
    api: veiculos,
    campos: ['placa', 'marca', 'modelo', 'ano'],
    camposForm: [
      { name: 'placa', label: 'Placa', type: 'text', required: true },
      { name: 'marca', label: 'Marca', type: 'text', required: true },
      { name: 'modelo', label: 'Modelo', type: 'text', required: true },
      { name: 'ano', label: 'Ano', type: 'number', required: true },
      { name: 'cor', label: 'Cor', type: 'text', required: false },
      { name: 'renavam', label: 'RENAVAM', type: 'text', required: false },
    ],
  },
  motoristas: {
    nome: 'Motoristas',
    api: motoristas,
    campos: ['nome', 'cpf', 'cnh', 'telefone'],
    camposForm: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'cpf', label: 'CPF', type: 'text', required: true, mask: 'cpf' },
      { name: 'cnh', label: 'CNH', type: 'text', required: true },
      { name: 'telefone', label: 'Telefone', type: 'text', required: false, mask: 'phone' },
      { name: 'email', label: 'Email', type: 'email', required: false },
      { name: 'endereco', label: 'Endereço', type: 'text', required: false },
    ],
  },
};

export default function Cadastros() {
  const [tipo, setTipo] = useState('clientes');
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const toast = useToastContext();

  const entidade = ENTIDADES[tipo];

  const carregar = async () => {
    try {
      setLoading(true);
      const response = await entidade.api.listar({ search: searchTerm, page: 1, limit: 50 });
      setItens(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [tipo, searchTerm]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({});
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Aplicar máscaras
    if (entidade.camposForm.find(f => f.name === name)?.mask === 'cpf') {
      processedValue = maskCPF(value);
    } else if (entidade.camposForm.find(f => f.name === name)?.mask === true) {
      // CPF ou CNPJ baseado no tamanho
      processedValue = value.length <= 11 ? maskCPF(value) : maskCNPJ(value);
    } else if (entidade.camposForm.find(f => f.name === name)?.mask === 'phone') {
      processedValue = maskPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    const requiredFields = entidade.camposForm.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.name]);
    
    if (missingFields.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        await entidade.api.atualizar(editingItem.id, formData);
        toast.success(`${entidade.nome.slice(0, -1)} atualizado com sucesso!`);
      } else {
        await entidade.api.criar(formData);
        toast.success(`${entidade.nome.slice(0, -1)} criado com sucesso!`);
      }
      handleCloseModal();
      carregar();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await entidade.api.deletar(itemToDelete);
      toast.success('Excluído com sucesso!');
      carregar();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao excluir');
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-text">Cadastros Base</h2>
        <div className="flex gap-2">
          <Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            options={Object.keys(ENTIDADES).map(k => ({
              value: k,
              label: ENTIDADES[k].nome,
            }))}
            className="w-48"
          />
          <Button variant="primary" leftIcon={Plus} onClick={() => handleOpenModal()}>
            Novo
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={entidade.campos.length + 1} />
        ) : itens.length === 0 ? (
          <EmptyState
            title={`Nenhum ${entidade.nome.toLowerCase()} encontrado`}
            description="Comece criando um novo registro"
            actionLabel={`Novo ${entidade.nome.slice(0, -1)}`}
            action={() => handleOpenModal()}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {entidade.campos.map((campo) => (
                    <th key={campo} className="text-left py-3 px-4 text-muted font-medium text-sm uppercase">{campo}</th>
                  ))}
                  <th className="text-right py-3 px-4 text-muted font-medium text-sm uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-surface transition-colors">
                    {entidade.campos.map((campo) => (
                      <td key={campo} className="py-3 px-4 text-text">{item[campo] || '-'}</td>
                    ))}
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="text-primary hover:text-primary-600 transition-colors"
                          aria-label="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="text-danger hover:text-red-600 transition-colors"
                          aria-label="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? `Editar ${entidade.nome.slice(0, -1)}` : `Novo ${entidade.nome.slice(0, -1)}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entidade.camposForm.map((campo) => (
              <Input
                key={campo.name}
                label={campo.label}
                type={campo.type}
                name={campo.name}
                value={formData[campo.name] || ''}
                onChange={handleChange}
                required={campo.required}
                placeholder={`Digite ${campo.label.toLowerCase()}`}
              />
            ))}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingItem ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
      />
    </div>
  );
}
