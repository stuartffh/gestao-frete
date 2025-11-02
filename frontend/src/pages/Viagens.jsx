import { useEffect, useState } from 'react';
import { Plus, Eye, FileText } from 'lucide-react';
import { getViagens, createViagem, getViagem, encerrarViagem } from '../api/viagens';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { LoadingPage } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { useToastContext } from '../components/Toaster';
import { clientes } from '../api/cadastros';

export default function Viagens() {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [viagemDetalhes, setViagemDetalhes] = useState(null);
  const [formData, setFormData] = useState({
    origem: '',
    destino: '',
    cliente_id: '',
    km_previsto: '',
    km_real: '',
    observacoes: '',
  });
  const [clientesList, setClientesList] = useState([]);
  const [saving, setSaving] = useState(false);
  const toast = useToastContext();

  const carregar = async () => {
    try {
      setLoading(true);
      const response = await getViagens({ page: 1, limit: 50 });
      setViagens(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      toast.error('Erro ao carregar viagens');
    } finally {
      setLoading(false);
    }
  };

  const carregarClientes = async () => {
    try {
      const response = await clientes.listar({ limit: 100 });
      setClientesList(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  useEffect(() => {
    carregar();
    carregarClientes();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      origem: '',
      destino: '',
      cliente_id: '',
      km_previsto: '',
      km_real: '',
      observacoes: '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      origem: '',
      destino: '',
      cliente_id: '',
      km_previsto: '',
      km_real: '',
      observacoes: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.origem || !formData.destino || !formData.cliente_id) {
      toast.error('Preencha origem, destino e cliente');
      return;
    }

    try {
      setSaving(true);
      await createViagem(formData);
      toast.success('Viagem criada com sucesso!');
      handleCloseModal();
      carregar();
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar viagem');
    } finally {
      setSaving(false);
    }
  };

  const handleVerDetalhes = async (id) => {
    try {
      const viagem = await getViagem(id);
      setViagemDetalhes(viagem);
      setModalDetalhesOpen(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      toast.error('Erro ao carregar detalhes da viagem');
    }
  };

  const handleEncerrar = async (id, kmReal) => {
    if (!kmReal) {
      toast.error('Informe o KM real para encerrar a viagem');
      return;
    }

    try {
      await encerrarViagem(id, { km_real: kmReal });
      toast.success('Viagem encerrada com sucesso!');
      setModalDetalhesOpen(false);
      carregar();
    } catch (error) {
      console.error('Erro ao encerrar viagem:', error);
      toast.error('Erro ao encerrar viagem');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-text">Viagens</h2>
        <Button variant="primary" leftIcon={Plus} onClick={handleOpenModal}>
          Nova Viagem
        </Button>
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : viagens.length === 0 ? (
          <EmptyState
            title="Nenhuma viagem encontrada"
            description="Comece criando uma nova viagem"
            actionLabel="Nova Viagem"
            action={handleOpenModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted font-medium text-sm uppercase">Rota</th>
                  <th className="text-left py-3 px-4 text-muted font-medium text-sm uppercase">Cliente</th>
                  <th className="text-left py-3 px-4 text-muted font-medium text-sm uppercase">KM</th>
                  <th className="text-left py-3 px-4 text-muted font-medium text-sm uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-muted font-medium text-sm uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {viagens.map((viagem) => (
                  <tr key={viagem.id} className="border-b border-border hover:bg-surface transition-colors">
                    <td className="py-3 px-4 text-text font-medium">
                      {viagem.origem} → {viagem.destino}
                    </td>
                    <td className="py-3 px-4 text-text">{viagem.cliente_nome || '-'}</td>
                    <td className="py-3 px-4 text-text">
                      {viagem.km_previsto || '-'} / {viagem.km_real || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={viagem.status === 'encerrada' ? 'success' : 'warning'}>
                        {viagem.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleVerDetalhes(viagem.id)}
                          className="text-primary hover:text-primary-600 transition-colors"
                          aria-label="Ver detalhes"
                        >
                          <Eye size={18} />
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

      {/* Modal de Criação */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Nova Viagem"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Origem"
              type="text"
              name="origem"
              value={formData.origem}
              onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
              required
              placeholder="Cidade de origem"
            />
            <Input
              label="Destino"
              type="text"
              name="destino"
              value={formData.destino}
              onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
              required
              placeholder="Cidade de destino"
            />
            <div className="md:col-span-2">
              <Select
                label="Cliente"
                value={formData.cliente_id}
                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                options={[
                  { value: '', label: 'Selecione um cliente' },
                  ...clientesList.map(c => ({ value: c.id, label: c.nome })),
                ]}
                required
              />
            </div>
            <Input
              label="KM Previsto"
              type="number"
              name="km_previsto"
              value={formData.km_previsto}
              onChange={(e) => setFormData({ ...formData, km_previsto: e.target.value })}
              placeholder="0"
            />
            <Input
              label="KM Real"
              type="number"
              name="km_real"
              value={formData.km_real}
              onChange={(e) => setFormData({ ...formData, km_real: e.target.value })}
              placeholder="0"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Observações sobre a viagem"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Criar Viagem
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={modalDetalhesOpen}
        onClose={() => setModalDetalhesOpen(false)}
        title={`Viagem: ${viagemDetalhes?.origem} → ${viagemDetalhes?.destino}`}
        size="lg"
      >
        {viagemDetalhes && (
          <div className="space-y-4">
            <Card padding="md" className="bg-surface">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted">Cliente</p>
                  <p className="font-medium text-text">{viagemDetalhes.cliente_nome || '-'}</p>
                </div>
                <div>
                  <p className="text-muted">Status</p>
                  <Badge variant={viagemDetalhes.status === 'encerrada' ? 'success' : 'warning'}>
                    {viagemDetalhes.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted">KM Previsto</p>
                  <p className="font-medium text-text">{viagemDetalhes.km_previsto || '-'}</p>
                </div>
                <div>
                  <p className="text-muted">KM Real</p>
                  <p className="font-medium text-text">{viagemDetalhes.km_real || '-'}</p>
                </div>
                {viagemDetalhes.observacoes && (
                  <div className="col-span-2">
                    <p className="text-muted">Observações</p>
                    <p className="text-text">{viagemDetalhes.observacoes}</p>
                  </div>
                )}
              </div>
            </Card>

            {viagemDetalhes.status !== 'encerrada' && (
              <div className="space-y-2">
                <Input
                  label="KM Real para encerrar"
                  type="number"
                  id="km_real_encerrar"
                  placeholder="Informe o KM real"
                />
                <Button
                  variant="primary"
                  onClick={() => {
                    const kmReal = document.getElementById('km_real_encerrar').value;
                    handleEncerrar(viagemDetalhes.id, kmReal);
                  }}
                >
                  Encerrar Viagem
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
