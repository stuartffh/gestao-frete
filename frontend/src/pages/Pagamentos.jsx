import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { getPagamentos, deletePagamento } from '../api/financeiro';
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

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const toast = useToastContext();

  const carregarPagamentos = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getPagamentos({ page, limit: 20, ...(tipoFilter && { tipo: tipoFilter }) });
      setPagamentos(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPagamentos();
  }, [tipoFilter]);

  const pagamentosFiltrados = pagamentos.filter((pag) => {
    const search = searchTerm.toLowerCase();
    return (
      pag.descricao?.toLowerCase().includes(search) ||
      pag.beneficiario?.toLowerCase().includes(search) ||
      pag.categoria?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text">Pagamentos</h2>
          <p className="text-muted mt-1">Gerencie todos os pagamentos e recebimentos</p>
        </div>
        <Link to="/pagamentos/novo">
          <Button variant="primary" leftIcon={Plus}>
            Novo Pagamento
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
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'pagar', label: 'Pagar' },
              { value: 'receber', label: 'Receber' },
            ]}
            className="w-full sm:w-48"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : pagamentosFiltrados.length === 0 ? (
          <EmptyState
            title="Nenhum pagamento encontrado"
            description="Comece criando um novo pagamento"
            actionLabel="Novo Pagamento"
            action={() => window.location.href = '/pagamentos/novo'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Descrição</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Tipo</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Valor</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Data</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase">Forma</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-muted uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagamentosFiltrados.map((pag) => (
                  <tr key={pag.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 text-text">{pag.descricao}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <Badge variant={pag.tipo === 'pagar' ? 'danger' : 'success'}>
                        {pag.tipo}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text font-semibold font-mono">
                      {formatMoney(pag.valor)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-muted">
                      {format(new Date(pag.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-muted">{pag.forma_pagamento || '-'}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/pagamentos/${pag.id}`}
                          className="text-primary hover:text-primary-600 transition-colors"
                          aria-label="Editar"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => deletePagamento(pag.id).then(() => carregarPagamentos())}
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

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={async () => {
          if (!itemToDelete) return;
          try {
            await deletePagamento(itemToDelete);
            toast.success('Pagamento excluído com sucesso!');
            carregarPagamentos();
          } catch (error) {
            toast.error('Erro ao excluir pagamento');
          } finally {
            setItemToDelete(null);
          }
        }}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
      />
    </div>
  );
}
