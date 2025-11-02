import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { getAlertas, marcarAlertaLido } from '../api/alertas';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { LoadingPage } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('all'); // all, lido, nao-lido

  const carregar = async () => {
    try {
      setLoading(true);
      const params = filtro !== 'all' ? { lido: filtro === 'lido' } : {};
      const response = await getAlertas(params);
      setAlertas(response || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [filtro]);

  const handleMarcarLido = async (id) => {
    try {
      await marcarAlertaLido(id);
      carregar();
    } catch (error) {
      console.error('Erro ao marcar alerta:', error);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'vencimento':
        return <AlertCircle className="text-red-400" size={20} />;
      default:
        return <Bell className="text-blue-400" size={20} />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'vencimento':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-text">Alertas e Notificações</h2>
        <Select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'nao-lido', label: 'Não lidos' },
            { value: 'lido', label: 'Lidos' },
          ]}
          className="w-48"
        />
      </div>

      <Card>
        {loading ? (
          <LoadingPage />
        ) : alertas.length === 0 ? (
          <EmptyState title="Nenhum alerta encontrado" />
        ) : (
          <div className="space-y-4">
            {alertas.map((alerta) => (
              <Card
                key={alerta.id}
                padding="md"
                className={`${getTipoColor(alerta.tipo)} ${
                  alerta.lido ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getTipoIcon(alerta.tipo)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-text">{alerta.titulo}</h3>
                        {alerta.lido && (
                          <Badge variant="muted" size="sm">Lido</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted mb-2">{alerta.mensagem}</p>
                      <p className="text-xs text-muted">
                        {alerta.created_at && format(new Date(alerta.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {!alerta.lido && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMarcarLido(alerta.id)}
                      leftIcon={CheckCircle}
                    >
                      Marcar lido
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

