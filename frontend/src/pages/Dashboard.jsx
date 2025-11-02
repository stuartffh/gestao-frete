import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FileText, DollarSign, CheckCircle, Clock, TrendingUp, Plus } from 'lucide-react';
import { getRelatorioDesempenho } from '../api/relatorios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getRelatorioPeriodo } from '../api/relatorios';
import { formatMoney } from '../lib/utils';

export default function Dashboard() {
  const [desempenho, setDesempenho] = useState(null);
  const [graficoPeriodo, setGraficoPeriodo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const hoje = new Date();
        const dataInicio = format(startOfMonth(subMonths(hoje, 5)), 'yyyy-MM-dd');
        const dataFim = format(endOfMonth(hoje), 'yyyy-MM-dd');

        const [desempenhoData, periodoData] = await Promise.all([
          getRelatorioDesempenho(dataInicio, dataFim),
          getRelatorioPeriodo(dataInicio, dataFim, 'mensal'),
        ]);

        setDesempenho(desempenhoData);
        setGraficoPeriodo(
          periodoData.map((item) => ({
            periodo: format(new Date(item.periodo), 'MMM/yyyy', { locale: ptBR }),
            valorTotal: parseFloat(item.valor_total || 0),
            valorPago: parseFloat(item.valor_pago || 0),
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const cards = [
    {
      title: 'Total de Notas',
      value: desempenho?.total_notas || 0,
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      title: 'Valor Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(desempenho?.valor_total || 0),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      title: 'Notas Pagas',
      value: desempenho?.notas_pagas || 0,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      title: 'Pendentes',
      value: desempenho?.notas_pendentes || 0,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <div className="text-muted">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text">Dashboard</h2>
          <p className="text-muted mt-1">
            Visão geral do sistema de gestão de frete
          </p>
        </div>
        <Link
          to="/notas/nova"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Nova Nota
        </Link>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-text">{card.value}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Icon className="text-primary" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de Período */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold text-text mb-4">
          Evolução Financeira
        </h3>
        <ResponsiveContainer width="100%" height={300} className="h-64 md:h-80">
          <LineChart data={graficoPeriodo} aria-label="Gráfico de evolução financeira">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="periodo" 
              stroke="var(--color-muted)"
              tick={{ fill: 'var(--color-muted)' }}
            />
            <YAxis 
              stroke="var(--color-muted)"
              tick={{ fill: 'var(--color-muted)' }}
              tickFormatter={(value) => formatMoney(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-md)',
              }}
              formatter={(value) => formatMoney(value)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="valorTotal"
              stroke="var(--color-primary)"
              name="Valor Total"
              strokeWidth={2}
              aria-label="Valor Total"
            />
            <Line
              type="monotone"
              dataKey="valorPago"
              stroke="var(--color-success)"
              name="Valor Pago"
              strokeWidth={2}
              aria-label="Valor Pago"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Taxa de Pagamento */}
      {desempenho && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold text-text mb-4">
            Taxa de Pagamento
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted">Percentual de notas pagas</span>
                <span className="text-text font-bold">
                  {desempenho.taxa_pagamento || 0}%
                </span>
              </div>
              <div className="w-full bg-surface rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${desempenho.taxa_pagamento || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

