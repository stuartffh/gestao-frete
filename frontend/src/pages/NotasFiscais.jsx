import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Plus, Search, Edit, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { getNotas, deleteNota } from '../api/notas';
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

export default function NotasFiscais() {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const toast = useToastContext();

  const carregarNotas = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
      };
      const response = await getNotas(params);
      setNotas(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNotas();
  }, [statusFilter]);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteNota(itemToDelete);
      toast.success('Nota fiscal excluída com sucesso!');
      carregarNotas(pagination.page);
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
      toast.error('Erro ao deletar nota fiscal');
    } finally {
      setItemToDelete(null);
    }
  };

  const notasFiltradas = notas.filter((nota) => {
    const search = searchTerm.toLowerCase();
    return (
      nota.numero?.toLowerCase().includes(search) ||
      nota.emitente?.toLowerCase().includes(search) ||
      nota.destinatario?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text">Notas Fiscais</h2>
          <p className="text-muted mt-1">Gerencie todas as suas notas fiscais</p>
        </div>
        <Link to="/notas/nova">
          <Button variant="primary" leftIcon={Plus}>
            Nova Nota
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por número, emitente ou destinatário..."
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
        ) : notasFiltradas.length === 0 ? (
          <EmptyState
            title="Nenhuma nota fiscal encontrada"
            description="Comece criando uma nova nota fiscal"
            actionLabel="Nova Nota"
            action={() => window.location.href = '/notas/nova'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Emitente
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Emissão
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Arquivos
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {notasFiltradas.map((nota) => (
                  <tr key={nota.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text">
                      {nota.numero}
                      {nota.serie && <span className="text-muted"> / {nota.serie}</span>}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-text">{nota.emitente}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text font-semibold font-mono">
                      {formatMoney(nota.valor)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-muted">
                      {format(new Date(nota.data_emissao), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          nota.status === 'paga' ? 'success' :
                          nota.status === 'vencida' ? 'danger' : 'warning'
                        }
                      >
                        {nota.status}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {nota.pdf_path && (
                          <FileText className="text-primary" size={18} />
                        )}
                        {nota.foto_path && (
                          <ImageIcon className="text-info" size={18} />
                        )}
                        {!nota.pdf_path && !nota.foto_path && (
                          <span className="text-muted text-xs">Sem arquivos</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/notas/${nota.id}`}
                          className="text-primary hover:text-primary-600 transition-colors"
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(nota.id)}
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
            onClick={() => carregarNotas(pagination.page - 1)}
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
            onClick={() => carregarNotas(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            size="sm"
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
      />
    </div>
  );
}
