import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Download } from 'lucide-react';
import {
  getRelatorioDesempenho,
  getRelatorioPeriodo,
  getRelatorioStatus,
  getRelatorioEmitentes,
  exportarRelatorio,
} from '../api/relatorios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import { LoadingPage } from '../components/ui/Loading';
import { formatMoney } from '../lib/utils';

export default function Relatorios() {
  const [tipoPeriodo, setTipoPeriodo] = useState('mensal');
  const [dataInicio, setDataInicio] = useState(
    format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [desempenho, setDesempenho] = useState(null);
  const [periodoData, setPeriodoData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [emitentesData, setEmitentesData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarRelatorios();
  }, [dataInicio, dataFim, tipoPeriodo]);

  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      const [desempenhoResult, periodoResult, statusResult, emitentesResult] = await Promise.all([
        getRelatorioDesempenho(dataInicio, dataFim),
        getRelatorioPeriodo(dataInicio, dataFim, tipoPeriodo),
        getRelatorioStatus(dataInicio, dataFim),
        getRelatorioEmitentes(dataInicio, dataFim, 10),
      ]);

      setDesempenho(desempenhoResult);
      setPeriodoData(periodoResult);
      setStatusData(statusResult);
      setEmitentesData(emitentesResult);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodoPredefinido = (tipo) => {
    const hoje = new Date();
    switch (tipo) {
      case 'semana':
        setDataInicio(format(startOfWeek(hoje, { locale: ptBR }), 'yyyy-MM-dd'));
        setDataFim(format(endOfWeek(hoje, { locale: ptBR }), 'yyyy-MM-dd'));
        setTipoPeriodo('diario');
        break;
      case 'mes':
        setDataInicio(format(startOfMonth(hoje), 'yyyy-MM-dd'));
        setDataFim(format(endOfMonth(hoje), 'yyyy-MM-dd'));
        setTipoPeriodo('diario');
        break;
      case 'ano':
        setDataInicio(format(startOfYear(hoje), 'yyyy-MM-dd'));
        setDataFim(format(endOfYear(hoje), 'yyyy-MM-dd'));
        setTipoPeriodo('mensal');
        break;
      default:
        break;
    }
  };

  const handleExportar = async () => {
    try {
      await exportarRelatorio(dataInicio, dataFim);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar relatório');
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  const periodoFormatado = periodoData.map((item) => {
    const date = new Date(item.periodo);
    let label = '';
    if (tipoPeriodo === 'diario') {
      label = format(date, 'dd/MM', { locale: ptBR });
    } else if (tipoPeriodo === 'semanal') {
      label = `Sem ${format(date, 'w', { locale: ptBR })}`;
    } else if (tipoPeriodo === 'mensal') {
      label = format(date, 'MMM/yyyy', { locale: ptBR });
    } else {
      label = format(date, 'yyyy', { locale: ptBR });
    }
    return {
      ...item,
      periodo: label,
      valorTotal: parseFloat(item.valor_total || 0),
      valorPago: parseFloat(item.valor_pago || 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text">Relatórios</h2>
          <p className="text-muted mt-1">Análises e estatísticas do sistema</p>
        </div>
        <Button variant="primary" onClick={handleExportar} leftIcon={Download}>
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => handlePeriodoPredefinido('semana')}
              size="sm"
            >
              Esta Semana
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePeriodoPredefinido('mes')}
              size="sm"
            >
              Este Mês
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePeriodoPredefinido('ano')}
              size="sm"
            >
              Este Ano
            </Button>
          </div>
          <Select
            value={tipoPeriodo}
            onChange={(e) => setTipoPeriodo(e.target.value)}
            options={[
              { value: 'diario', label: 'Diário' },
              { value: 'semanal', label: 'Semanal' },
              { value: 'mensal', label: 'Mensal' },
              { value: 'anual', label: 'Anual' },
            ]}
            className="w-full md:w-48"
          />
        </div>
      </Card>

      {loading ? (
        <LoadingPage message="Carregando relatórios..." />
      ) : (
        <>
          {/* Métricas de Desempenho */}
          {desempenho && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card padding="md">
                <p className="text-muted text-sm mb-1">Total de Notas</p>
                <p className="text-2xl font-bold text-text">{desempenho.total_notas}</p>
              </Card>
              <Card padding="md">
                <p className="text-muted text-sm mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-success">
                  {formatMoney(desempenho.valor_total || 0)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-muted text-sm mb-1">Valor Pago</p>
                <p className="text-2xl font-bold text-success">
                  {formatMoney(desempenho.valor_pago || 0)}
                </p>
              </Card>
              <Card padding="md">
                <p className="text-muted text-sm mb-1">Taxa de Pagamento</p>
                <p className="text-2xl font-bold text-primary">{desempenho.taxa_pagamento || 0}%</p>
              </Card>
            </div>
          )}

          {/* Gráfico de Período */}
          <Card padding="lg">
            <h3 className="text-xl font-semibold text-text mb-4">Evolução por Período</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={periodoFormatado}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="periodo" stroke="var(--color-muted)" />
                <YAxis stroke="var(--color-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <Legend />
                <Bar dataKey="valorTotal" fill="var(--color-primary)" name="Valor Total" />
                <Bar dataKey="valorPago" fill="var(--color-success)" name="Valor Pago" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Status */}
            <Card padding="lg">
              <h3 className="text-xl font-semibold text-text mb-4">Distribuição por Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Emitentes */}
            <Card padding="lg">
              <h3 className="text-xl font-semibold text-text mb-4">Top Emitentes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emitentesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-muted)" />
                  <YAxis dataKey="emitente" type="category" stroke="var(--color-muted)" width={150} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                  <Bar dataKey="valor_total" fill="var(--color-primary)" name="Valor Total" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

