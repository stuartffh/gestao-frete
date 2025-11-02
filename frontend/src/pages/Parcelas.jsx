import { useEffect, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { getParcelas, gerarParcelas } from '../api/parcelas';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { formatMoney } from '../lib/utils';
import { useToastContext } from '../components/Toaster';
import { getContasPagar, getContasReceber } from '../api/financeiro';

export default function Parcelas() {
  const [parcelas, setParcelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    conta_id: '',
    conta_tipo: 'pagar',
    numero_parcelas: 2,
    valor_parcela: '',
    data_primeiro_vencimento: '',
  });
  const [contas, setContas] = useState([]);
  const [loadingContas, setLoadingContas] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToastContext();

  const carregar = async () => {
    try {
      setLoading(true);
      const response = await getParcelas({ page: 1, limit: 50 });
      setParcelas(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar parcelas:', error);
      toast.error('Erro ao carregar parcelas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleOpenModal = async () => {
    setFormData({
      conta_id: '',
      conta_tipo: 'pagar',
      numero_parcelas: 2,
      valor_parcela: '',
      data_primeiro_vencimento: '',
    });
    await carregarContas('pagar');
    setModalOpen(true);
  };

  const carregarContas = async (tipo) => {
    try {
      setLoadingContas(true);
      const response = tipo === 'pagar' 
        ? await getContasPagar({ limit: 100 })
        : await getContasReceber({ limit: 100 });
      setContas(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast.error('Erro ao carregar contas');
    } finally {
      setLoadingContas(false);
    }
  };

  const handleTipoChange = (tipo) => {
    setFormData({ ...formData, conta_tipo: tipo, conta_id: '' });
    carregarContas(tipo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.conta_id || !formData.numero_parcelas || !formData.data_primeiro_vencimento) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      await gerarParcelas({
        conta_id: formData.conta_id,
        conta_tipo: formData.conta_tipo,
        numero_parcelas: parseInt(formData.numero_parcelas),
        valor_parcela: formData.valor_parcela ? parseFloat(formData.valor_parcela) : null,
        data_primeiro_vencimento: formData.data_primeiro_vencimento,
      });
      toast.success('Parcelas geradas com sucesso!');
      setModalOpen(false);
      carregar();
    } catch (error) {
      console.error('Erro ao gerar parcelas:', error);
      toast.error(error.response?.data?.message || 'Erro ao gerar parcelas');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-text">Parcelas</h2>
        <Button variant="primary" leftIcon={Plus} onClick={handleOpenModal}>
          Gerar Parcelas
        </Button>
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : parcelas.length === 0 ? (
          <EmptyState
            title="Nenhuma parcela encontrada"
            description="Gere parcelas a partir de uma conta"
            actionLabel="Gerar Parcelas"
            action={handleOpenModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted font-medium text-sm uppercase">Parcela</th>
                  <th className="text-left py-3 px-4 text-muted font-medium text-sm uppercase">Valor</th>
                  <th className="text-left py-3 px-4 text-muted font-medium text-sm uppercase">Vencimento</th>
                  <th className="text-left py-3 px-4 text-muted font-medium text-sm uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {parcelas.map((parcela) => (
                  <tr key={parcela.id} className="border-b border-border hover:bg-surface transition-colors">
                    <td className="py-3 px-4 text-text">
                      {parcela.numero_parcela}/{parcela.total_parcelas}
                    </td>
                    <td className="py-3 px-4 text-text font-mono">
                      {formatMoney(parcela.valor)}
                    </td>
                    <td className="py-3 px-4 text-text">
                      {parcela.data_vencimento ? format(new Date(parcela.data_vencimento), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={parcela.status === 'paga' ? 'success' : 'warning'}>
                        {parcela.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Geração de Parcelas */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Gerar Parcelas"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tipo de Conta"
            value={formData.conta_tipo}
            onChange={(e) => handleTipoChange(e.target.value)}
            options={[
              { value: 'pagar', label: 'Conta a Pagar' },
              { value: 'receber', label: 'Conta a Receber' },
            ]}
          />

          {loadingContas ? (
            <div className="text-center py-4 text-muted">Carregando contas...</div>
          ) : (
            <Select
              label="Conta"
              value={formData.conta_id}
              onChange={(e) => setFormData({ ...formData, conta_id: e.target.value })}
              options={[
                { value: '', label: 'Selecione uma conta' },
                ...contas.map(c => ({
                  value: c.id,
                  label: `${c.descricao} - ${formatMoney(c.valor)}`,
                })),
              ]}
              required
            />
          )}

          <Input
            label="Número de Parcelas"
            type="number"
            min="2"
            max="60"
            value={formData.numero_parcelas}
            onChange={(e) => setFormData({ ...formData, numero_parcelas: e.target.value })}
            required
          />

          <Input
            label="Data do Primeiro Vencimento"
            type="date"
            value={formData.data_primeiro_vencimento}
            onChange={(e) => setFormData({ ...formData, data_primeiro_vencimento: e.target.value })}
            required
          />

          <Input
            label="Valor por Parcela (opcional - divide o valor total se não informado)"
            type="number"
            step="0.01"
            value={formData.valor_parcela}
            onChange={(e) => setFormData({ ...formData, valor_parcela: e.target.value })}
            helperText="Se não informado, o valor total da conta será dividido igualmente"
          />

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Gerar Parcelas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
