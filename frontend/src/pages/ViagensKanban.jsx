import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import Button from '../components/ui/Button';
import { Plus, List, Calendar, MapPin, DollarSign } from 'lucide-react';
import { getViagens, updateViagem } from '../api/viagens';
import { useToast } from '../contexts/ToastContext';
import { formatMoney } from '../lib/utils';
import Badge from '../components/ui/Badge';

export default function ViagensKanban() {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    carregarViagens();
  }, []);

  const carregarViagens = async () => {
    setLoading(true);
    try {
      const data = await getViagens();
      setViagens(data);
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      addToast('Erro ao carregar viagens', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (item, fromColumn, toColumn) => {
    try {
      // Atualizar status da viagem
      await updateViagem(item.id, { status: toColumn });

      // Atualizar estado local
      setViagens((prev) =>
        prev.map((v) => (v.id === item.id ? { ...v, status: toColumn } : v))
      );

      addToast(`Viagem #${item.id} movida para ${getStatusLabel(toColumn)}`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      addToast('Erro ao atualizar status da viagem', 'error');
      // Recarregar para reverter mudança visual
      carregarViagens();
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      aberta: 'Abertas',
      em_andamento: 'Em Andamento',
      encerrada: 'Encerradas',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status) => {
    const variants = {
      aberta: 'info',
      em_andamento: 'warning',
      encerrada: 'success',
    };
    return variants[status] || 'default';
  };

  const renderCard = (viagem) => (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-text">#{viagem.id}</h4>
          <p className="text-xs text-muted mt-1">
            {new Date(viagem.data_inicio).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Badge variant={getStatusVariant(viagem.status)}>
          {viagem.status}
        </Badge>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2 text-muted">
          <MapPin size={14} aria-hidden="true" />
          <span className="truncate">{viagem.origem} → {viagem.destino}</span>
        </div>

        {viagem.cliente_nome && (
          <div className="flex items-center gap-2 text-muted">
            <Calendar size={14} aria-hidden="true" />
            <span className="truncate">{viagem.cliente_nome}</span>
          </div>
        )}

        {viagem.receita_total && (
          <div className="flex items-center gap-2 text-success font-medium">
            <DollarSign size={14} aria-hidden="true" />
            <span>{formatMoney(viagem.receita_total)}</span>
          </div>
        )}

        {viagem.km_real && (
          <div className="text-xs text-muted">
            {viagem.km_real} km
            {viagem.custo_por_km && ` • ${formatMoney(viagem.custo_por_km)}/km`}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(`/viagens/${viagem.id}`)}
        className="w-full mt-2 text-xs text-primary hover:underline"
      >
        Ver detalhes →
      </button>
    </div>
  );

  const columns = [
    {
      id: 'aberta',
      title: 'Abertas',
      items: viagens.filter((v) => v.status === 'aberta'),
    },
    {
      id: 'em_andamento',
      title: 'Em Andamento',
      items: viagens.filter((v) => v.status === 'em_andamento'),
    },
    {
      id: 'encerrada',
      title: 'Encerradas',
      items: viagens.filter((v) => v.status === 'encerrada'),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Carregando viagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Viagens - Kanban</h1>
          <p className="text-muted mt-1">
            Arraste os cards para alterar o status das viagens
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/viagens')}
            aria-label="Ver como lista"
          >
            <List size={18} />
            Lista
          </Button>
          <Button onClick={() => navigate('/viagens/nova')}>
            <Plus size={18} />
            Nova Viagem
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">{col.title}</span>
              <span className="text-2xl font-bold text-text">{col.items.length}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <KanbanBoard columns={columns} onDragEnd={handleDragEnd} renderCard={renderCard} />

      {viagens.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted mb-4">Nenhuma viagem encontrada</p>
          <Button onClick={() => navigate('/viagens/nova')}>
            <Plus size={18} />
            Criar primeira viagem
          </Button>
        </div>
      )}
    </div>
  );
}
