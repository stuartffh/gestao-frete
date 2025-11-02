import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Plus, Search, Edit, Trash2, CheckCircle } from 'lucide-react';
import { getContasReceber, deleteContaReceber, marcarComoRecebida } from '../api/financeiro';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';
import { formatMoney } from '../lib/utils';
import { useToastContext } from '../components/Toaster';

export default function ContasReceber() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmRecebidaOpen, setConfirmRecebidaOpen] = useState(false);
  const [itemAction, setItemAction] = useState(null);
  const toast = useToastContext();

  const carregarContas = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getContasReceber({ page, limit: 20, ...(statusFilter && { status: statusFilter }) });
      setContas(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarContas();
  }, [statusFilter]);

  const contasFiltradas = contas.filter((conta) => {
    const search = searchTerm.toLowerCase();
    return (
      conta.descricao?.toLowerCase().includes(search) ||
      conta.cliente?.toLowerCase().includes(search) ||
      conta.categoria?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text">Contas a Receber</h2>
          <p className="text-muted mt-1">Gerencie todas as suas contas a receber</p>
        </div>
        <Link to="/contas-receber/nova">
          <Button variant="primary" leftIcon={Plus}>
            Nova Conta
          </Button>
        </Link>
      </div>

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'recebida', label: 'Recebida' },
              { value: 'pendente', label: 'Pendente' },
              { value: 'vencida', label: 'Vencida' },
            ]}
            className="w-full sm:w-48"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : contasFiltradas.length === 0 ? (
          <EmptyState
            title="Nenhuma conta encontrada"
            description="Comece criando uma nova conta"
            actionLabel="Nova Conta"
            action={() => window.location.href = '/contas-receber/nova'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Descrição</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Cliente</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Valor</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Vencimento</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-muted uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contasFiltradas.map((conta) => (
                  <tr key={conta.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 text-text">{conta.descricao}</td>
                    <td className="px-4 sm:px-6 py-4 text-text">{conta.cliente || '-'}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text font-semibold font-mono">
                      {formatMoney(conta.valor)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-muted">
                      {format(new Date(conta.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          conta.status === 'recebida' ? 'success' :
                          conta.status === 'vencida' ? 'danger' : 'warning'
                        }
                      >
                        {conta.status}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/contas-receber/${conta.id}`}
                          className="text-primary hover:text-primary-600 transition-colors"
                          aria-label="Editar"
                        >
                          <Edit size={18} />
                        </Link>
                        {conta.status !== 'recebida' && (
                          <button
                            onClick={() => marcarComoRecebida(conta.id).then(() => carregarContas())}
                            className="text-success hover:text-green-600 transition-colors"
                            aria-label="Marcar como recebida"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteContaReceber(conta.id).then(() => carregarContas())}
                          className="text-danger hover:text-red-600 transition-colors"
                          aria-label="Deletar"
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

      {/* Modais de Confirmação */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setItemAction(null);
        }}
        onConfirm={async () => {
          if (!itemAction || itemAction.type !== 'delete') return;
          try {
            await deleteContaReceber(itemAction.id);
            toast.success('Conta excluída com sucesso!');
            carregarContas();
          } catch (error) {
            toast.error('Erro ao excluir conta');
          } finally {
            setItemAction(null);
          }
        }}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
      />

      <ConfirmModal
        isOpen={confirmRecebidaOpen}
        onClose={() => {
          setConfirmRecebidaOpen(false);
          setItemAction(null);
        }}
        onConfirm={async () => {
          if (!itemAction || itemAction.type !== 'recebida') return;
          try {
            await marcarComoRecebida(itemAction.id);
            toast.success('Conta marcada como recebida!');
            carregarContas();
          } catch (error) {
            toast.error('Erro ao marcar como recebida');
          } finally {
            setItemAction(null);
          }
        }}
        title="Marcar como Recebida"
        message="Deseja marcar esta conta como recebida?"
        confirmLabel="Marcar como Recebida"
        variant="primary"
      />
    </div>
  );
}
