import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Brain, TrendingUp, AlertTriangle, ThumbsUp, ThumbsDown, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function Inteligencia() {
  const [insights, setInsights] = useState([]);
  const [ocrQueue, setOcrQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Dados mockados para exemplo (em produção, viria da API)
  const insightsMock = [
    {
      id: 1,
      tipo: 'aten\u00e7\u00e3o',
      prioridade: 'alta',
      titulo: 'Aumento de despesas em combust\u00edvel',
      descricao: 'Despesas com combust\u00edvel aumentaram 23% no \u00faltimo m\u00eas. Considere revisar rotas ou fornecedores.',
      impacto: 'R$ 3.450,00/m\u00eas',
      acoes: ['Revisar rotas', 'Negociar com fornecedores', 'Analisar consumo por ve\u00edculo'],
      feedback: null,
    },
    {
      id: 2,
      tipo: 'oportunidade',
      prioridade: 'media',
      titulo: 'Potencial de otimiza\u00e7\u00e3o de viagens',
      descricao: '3 viagens poderiam ser consolidadas, reduzindo custos em at\u00e9 15%.',
      impacto: 'R$ 1.200,00 de economia potencial',
      acoes: ['Consolidar viagens #12, #15, #18', 'Revisar agendamento'],
      feedback: null,
    },
    {
      id: 3,
      tipo: 'sucesso',
      prioridade: 'baixa',
      titulo: 'Melhoria no custo por km',
      descricao: 'Custo m\u00e9dio por km reduziu 8% nos \u00faltimos 30 dias.',
      impacto: 'R$ 890,00 economizados',
      acoes: [],
      feedback: null,
    },
  ];

  useEffect(() => {
    // Carregar insights (mockado)
    setInsights(insightsMock);
  }, []);

  const handleFeedback = (insightId, isUtil) => {
    setInsights((prev) =>
      prev.map((i) => (i.id === insightId ? { ...i, feedback: isUtil } : i))
    );
    addToast(`Feedback registrado!`, 'success');
  };

  const getIconeInsight = (tipo) => {
    switch (tipo) {
      case 'aten\u00e7\u00e3o':
        return <AlertTriangle className="text-warning" size={24} />;
      case 'oportunidade':
        return <TrendingUp className="text-primary" size={24} />;
      case 'sucesso':
        return <CheckCircle className="text-success" size={24} />;
      default:
        return <Brain className="text-info" size={24} />;
    }
  };

  const getVariantePrioridade = (prioridade) => {
    switch (prioridade) {
      case 'alta':
        return 'danger';
      case 'media':
        return 'warning';
      default:
        return 'info';
    }
  };

  const processarOCR = async (files) => {
    setLoading(true);
    try {
      // Simula\u00e7\u00e3o de processamento OCR em lote
      const novosItens = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        nome: file.name,
        status: 'aguardando',
        progresso: 0,
        confiabilidade: null,
      }));

      setOcrQueue(novosItens);

      // Simular processamento gradual
      for (let i = 0; i < novosItens.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setOcrQueue((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? { ...item, status: 'processando', progresso: 50 }
              : item
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 1500));
        setOcrQueue((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                  ...item,
                  status: 'conclu\u00eddo',
                  progresso: 100,
                  confiabilidade: Math.random() * 30 + 70, // 70-100%
                }
              : item
          )
        );
      }

      addToast(`${novosItens.length} arquivo(s) processado(s) com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro no OCR:', error);
      addToast('Erro ao processar arquivos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processarOCR(files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-3">
            <Brain className="text-primary" size={32} />
            Intelig\u00eancia
          </h1>
          <p className="text-muted mt-1">
            Insights autom\u00e1ticos e processamento de documentos
          </p>
        </div>
      </div>

      {/* Insights */}
      <div>
        <h2 className="text-xl font-semibold text-text mb-4">Insights Priorit\u00e1rios</h2>
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getIconeInsight(insight.tipo)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-text">{insight.titulo}</h3>
                      <p className="text-sm text-muted mt-1">{insight.descricao}</p>
                    </div>
                    <Badge variant={getVariantePrioridade(insight.prioridade)}>
                      {insight.prioridade}
                    </Badge>
                  </div>

                  {insight.impacto && (
                    <div className="bg-surface rounded px-3 py-2 my-3">
                      <span className="text-sm font-medium text-text">Impacto: </span>
                      <span className="text-sm text-primary font-semibold">
                        {insight.impacto}
                      </span>
                    </div>
                  )}

                  {insight.acoes.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-muted mb-2">A\u00e7\u00f5es sugeridas:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {insight.acoes.map((acao, idx) => (
                          <li key={idx} className="text-sm text-text">
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted mr-2">Este insight foi \u00fatil?</span>
                    <Button
                      variant={insight.feedback === true ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleFeedback(insight.id, true)}
                      aria-label="Insight \u00fatil"
                    >
                      <ThumbsUp size={14} />
                      Sim
                    </Button>
                    <Button
                      variant={insight.feedback === false ? 'danger' : 'outline'}
                      size="sm"
                      onClick={() => handleFeedback(insight.id, false)}
                      aria-label="Insight n\u00e3o \u00fatil"
                    >
                      <ThumbsDown size={14} />
                      N\u00e3o
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* OCR em Lote */}
      <div>
        <h2 className="text-xl font-semibold text-text mb-4">OCR em Lote</h2>
        <Card>
          <Card.Content>
            <div className="space-y-4">
              <div className="text-center py-8">
                <input
                  type="file"
                  id="ocr-upload"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
                <label htmlFor="ocr-upload">
                  <Button
                    as="span"
                    variant="primary"
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    <Upload size={18} />
                    {loading ? 'Processando...' : 'Selecionar Arquivos'}
                  </Button>
                </label>
                <p className="text-xs text-muted mt-2">
                  Aceita PDF e imagens (JPG, PNG). M\u00faltiplos arquivos permitidos.
                </p>
              </div>

              {ocrQueue.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-text">Fila de Processamento</h3>
                  {ocrQueue.map((item) => (
                    <div
                      key={item.id}
                      className="bg-surface border border-border rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text truncate flex-1">
                          {item.nome}
                        </span>
                        {item.status === 'aguardando' && (
                          <Clock className="text-muted" size={16} />
                        )}
                        {item.status === 'processando' && (
                          <div className="animate-spin">
                            <Clock className="text-primary" size={16} />
                          </div>
                        )}
                        {item.status === 'conclu\u00eddo' && (
                          <CheckCircle className="text-success" size={16} />
                        )}
                        {item.status === 'erro' && (
                          <XCircle className="text-danger" size={16} />
                        )}
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${item.progresso}%` }}
                        />
                      </div>
                      {item.confiabilidade && (
                        <p className="text-xs text-muted mt-2">
                          Confiabilidade: {item.confiabilidade.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
