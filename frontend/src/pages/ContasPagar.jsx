import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Plus, Search, Edit, Trash2, CheckCircle, Upload, FileText } from 'lucide-react';
import { getContasPagar, deleteContaPagar, marcarComoPaga, uploadComprovantePagar } from '../api/financeiro';
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

export default function ContasPagar() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmPagaOpen, setConfirmPagaOpen] = useState(false);
  const [itemAction, setItemAction] = useState(null);
  const toast = useToastContext();

  const carregarContas = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
      };
      const response = await getContasPagar(params);
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

  const handleDeleteClick = (id) => {
    setItemAction({ id, type: 'delete' });
    setConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!itemAction || itemAction.type !== 'delete') return;
    try {
      await deleteContaPagar(itemAction.id);
      toast.success('Conta excluída com sucesso!');
      carregarContas(pagination.page);
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast.error('Erro ao deletar conta');
    } finally {
      setItemAction(null);
    }
  };

  const handleMarcarComoPagaClick = (id) => {
    setItemAction({ id, type: 'paga' });
    setConfirmPagaOpen(true);
  };

  const handleMarcarComoPaga = async () => {
    if (!itemAction || itemAction.type !== 'paga') return;
    try {
      await marcarComoPaga(itemAction.id, { data_pagamento: new Date().toISOString().split('T')[0] });
      toast.success('Conta marcada como paga!');
      carregarContas(pagination.page);
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
      toast.error('Erro ao marcar conta como paga');
    } finally {
      setItemAction(null);
    }
  };

  const handleUploadComprovante = async (id, file) => {
    try {
      await uploadComprovantePagar(id, file);
      toast.success('Comprovante enviado com sucesso!');
      carregarContas(pagination.page);
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      toast.error('Erro ao enviar comprovante');
    }
  };

  const contasFiltradas = contas.filter((conta) => {
    const search = searchTerm.toLowerCase();
    return (
      conta.descricao?.toLowerCase().includes(search) ||
      conta.fornecedor?.toLowerCase().includes(search) ||
      conta.categoria?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text">Contas a Pagar</h2>
          <p className="text-muted mt-1">Gerencie todas as suas contas a pagar</p>
        </div>
        <Link to="/contas-pagar/nova">
          <Button variant="primary" leftIcon={Plus}>
            Nova Conta
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por descrição, fornecedor ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'paga', label: 'Paga' },
              { value: 'pendente', label: 'Pendente' },
              { value: 'vencida', label: 'Vencida' },
            ]}
            className="w-full sm:w-48"
          />
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : contasFiltradas.length === 0 ? (
          <EmptyState
            title="Nenhuma conta a pagar encontrada"
            description="Comece criando uma nova conta"
            actionLabel="Nova Conta"
            action={() => window.location.href = '/contas-pagar/nova'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Comprovante
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contasFiltradas.map((conta) => (
                  <tr key={conta.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 text-text">{conta.descricao}</td>
                    <td className="px-4 sm:px-6 py-4 text-text">{conta.fornecedor || '-'}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text font-semibold font-mono">
                      {formatMoney(conta.valor)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-muted">
                      {format(new Date(conta.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          conta.status === 'paga' ? 'success' :
                          conta.status === 'vencida' ? 'danger' : 'warning'
                        }
                      >
                        {conta.status}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {conta.comprovante_path ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${conta.comprovante_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-600 transition-colors"
                          aria-label="Ver comprovante"
                        >
                          <FileText size={18} />
                        </a>
                      ) : (
                        <label className="cursor-pointer text-muted hover:text-primary transition-colors">
                          <Upload size={18} />
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleUploadComprovante(conta.id, file);
                            }}
                          />
                        </label>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/contas-pagar/${conta.id}`}
                          className="text-primary hover:text-primary-600 transition-colors"
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Edit size={18} />
                        </Link>
                        {conta.status !== 'paga' && (
                          <button
                            onClick={() => handleMarcarComoPagaClick(conta.id)}
                            className="text-success hover:text-green-600 transition-colors"
                            title="Marcar como paga"
                            aria-label="Marcar como paga"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(conta.id)}
                          className="text-danger hover:text-red-600 transition-colors"
                          title="Deletar"
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

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => carregarContas(pagination.page - 1)}
            disabled={pagination.page === 1}
            size="sm"
          >
            Anterior
          </Button>
          <span className="text-muted">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => carregarContas(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            size="sm"
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Modais de Confirmação */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setItemAction(null);
        }}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
      />

      <ConfirmModal
        isOpen={confirmPagaOpen}
        onClose={() => {
          setConfirmPagaOpen(false);
          setItemAction(null);
        }}
        onConfirm={handleMarcarComoPaga}
        title="Marcar como Paga"
        message="Deseja marcar esta conta como paga?"
        confirmLabel="Marcar como Paga"
        variant="primary"
      />
    </div>
  );
}
