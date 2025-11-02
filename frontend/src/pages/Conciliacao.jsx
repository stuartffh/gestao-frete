import { useState } from 'react';
import { CheckCircle, AlertCircle, Link2 } from 'lucide-react';
import { processarExtrato, confirmarMatch } from '../api/importacao';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Card from '../components/ui/Card';
import Dropzone from '../components/ui/Dropzone';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useToastContext } from '../components/Toaster';

export default function Conciliacao() {
  const [loading, setLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [erro, setErro] = useState(null);
  const [confirmMatchOpen, setConfirmMatchOpen] = useState(false);
  const [matchToConfirm, setMatchToConfirm] = useState(null);
  const toast = useToastContext();

  const handleFileChange = async (file) => {
    if (!file) return;

    setLoading(true);
    setSugestoes([]);
    setErro(null);

    try {
      const response = await processarExtrato(file);
      setSugestoes(response.sugestoes || []);
    } catch (error) {
      setErro(error.message || 'Erro ao processar extrato');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarMatchClick = (transacao, match) => {
    setMatchToConfirm({ transacao, match });
    setConfirmMatchOpen(true);
  };

  const handleConfirmarMatch = async () => {
    if (!matchToConfirm) return;

    const { transacao, match } = matchToConfirm;

    try {
      await confirmarMatch({
        transacao,
        conta_id: match.id,
        conta_tipo: match.tipo,
      });

      toast.success('Match confirmado e conta atualizada com sucesso!');
      
      // Remover da lista de sugestões
      setSugestoes(sugestoes.filter((s, idx) => {
        const matchIdx = s.matches.findIndex(m => m.id === match.id && m.tipo === match.tipo);
        if (matchIdx !== -1) {
          s.matches.splice(matchIdx, 1);
        }
        return s.matches.length > 0;
      }));
      
      setMatchToConfirm(null);
    } catch (error) {
      console.error('Erro ao confirmar match:', error);
      toast.error('Erro ao confirmar match');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text">Conciliação de Extrato</h2>

      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted mb-2">
              Extrato Bancário (CSV)
            </h3>
            <Dropzone
              accept=".csv"
              onFilesSelected={(file) => handleFileChange(file)}
            />
          </div>

          <div className="p-4 bg-surface rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted mb-2">Formato esperado:</h3>
            <p className="text-sm text-muted">
              CSV com colunas: data, valor, descricao
            </p>
          </div>

          {erro && (
            <div className="p-4 bg-danger/20 border border-danger/30 rounded-lg">
              <div className="flex items-center gap-2 text-danger">
                <AlertCircle size={20} />
                <span>{erro}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {sugestoes.length > 0 && (
        <Card>
          <h3 className="text-xl font-semibold text-text mb-4">
            Sugestões de Match ({sugestoes.length})
          </h3>

          <div className="space-y-4">
            {sugestoes.map((sugestao, idx) => (
              <Card key={idx} padding="md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-muted mb-1">Transação:</p>
                    <p className="text-text font-medium">{sugestao.transacao.descricao}</p>
                    <p className="text-sm text-muted mt-1">
                      {sugestao.transacao.data && format(new Date(sugestao.transacao.data), 'dd/MM/yyyy', { locale: ptBR })}
                      {' - R$ '}
                      {parseFloat(sugestao.transacao.valor).toFixed(2)}
                    </p>
                  </div>
                </div>

                {sugestao.matches.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted mb-2">
                      Matches encontrados:
                    </p>
                    {sugestao.matches.map((match, matchIdx) => (
                      <Card key={matchIdx} padding="sm" className="bg-surface">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant={match.tipo === 'pagar' ? 'danger' : 'success'}>
                                {match.tipo === 'pagar' ? 'Conta a Pagar' : 'Conta a Receber'}
                              </Badge>
                              <Badge variant="muted" size="sm">
                                Score: {match.score}
                              </Badge>
                            </div>
                            <p className="text-text font-medium">{match.descricao}</p>
                            <p className="text-sm text-muted">
                              R$ {parseFloat(match.valor).toFixed(2)} - 
                              Vencimento: {match.data_vencimento && format(new Date(match.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirmarMatchClick(sugestao.transacao, match)}
                            leftIcon={Link2}
                          >
                            Confirmar
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Nenhum match encontrado</p>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={confirmMatchOpen}
        onClose={() => {
          setConfirmMatchOpen(false);
          setMatchToConfirm(null);
        }}
        onConfirm={handleConfirmarMatch}
        title="Confirmar Match"
        message={matchToConfirm ? `Confirmar match entre transação e ${matchToConfirm.match.tipo === 'pagar' ? 'conta a pagar' : 'conta a receber'}?` : ''}
        confirmLabel="Confirmar"
        variant="primary"
      />
    </div>
  );
}

