import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Download } from 'lucide-react';
import { getRelatorioFluxoCaixa, getRelatorioCategoria, exportarCSV, exportarXLSX, exportarPDF } from '../api/financeiro';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { LoadingPage } from '../components/ui/Loading';
import { formatMoney } from '../lib/utils';

export default function RelatoriosFinanceiro() {
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [fluxoCaixa, setFluxoCaixa] = useState(null);
  const [categoriaPagar, setCategoriaPagar] = useState([]);
  const [categoriaReceber, setCategoriaReceber] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarRelatorios();
  }, [dataInicio, dataFim]);

  const carregarRelatorios = async () => {
    try {
      setLoading(true);
      const [fluxo, catPagar, catReceber] = await Promise.all([
        getRelatorioFluxoCaixa(dataInicio, dataFim),
        getRelatorioCategoria('pagar', dataInicio, dataFim),
        getRelatorioCategoria('receber', dataInicio, dataFim),
      ]);
      setFluxoCaixa(fluxo);
      setCategoriaPagar(catPagar);
      setCategoriaReceber(catReceber);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text">Relatórios Financeiro</h2>
          <p className="text-muted mt-1">Análises e exportações do módulo financeiro</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => exportarCSV('pagar', dataInicio, dataFim)}
            leftIcon={Download}
            size="sm"
          >
            CSV Pagar
          </Button>
          <Button
            variant="outline"
            onClick={() => exportarXLSX('pagar', dataInicio, dataFim)}
            leftIcon={Download}
            size="sm"
          >
            XLSX
          </Button>
          <Button
            variant="outline"
            onClick={() => exportarPDF('pagar', dataInicio, dataFim)}
            leftIcon={Download}
            size="sm"
          >
            PDF
          </Button>
        </div>
      </div>

      <Card padding="md">
        <div className="flex gap-4 flex-wrap">
          <Input
            type="date"
            label="Data Início"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Input
            type="date"
            label="Data Fim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
        </div>
      </Card>

      {loading ? (
        <LoadingPage message="Carregando relatórios..." />
      ) : fluxoCaixa && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="md">
              <p className="text-muted text-sm mb-1">Saldo</p>
              <p className="text-2xl font-bold text-text">
                {formatMoney(fluxoCaixa.saldo || 0)}
              </p>
            </Card>
            <Card padding="md">
              <p className="text-muted text-sm mb-1">Total Pago</p>
              <p className="text-2xl font-bold text-danger">
                {formatMoney(fluxoCaixa.contasPagar?.total_pago || 0)}
              </p>
            </Card>
            <Card padding="md">
              <p className="text-muted text-sm mb-1">Total Recebido</p>
              <p className="text-2xl font-bold text-success">
                {formatMoney(fluxoCaixa.contasReceber?.total_recebido || 0)}
              </p>
            </Card>
            <Card padding="md">
              <p className="text-muted text-sm mb-1">Pendente Pagar</p>
              <p className="text-2xl font-bold text-warning">
                {formatMoney(fluxoCaixa.contasPagar?.total_pendente_pagar || 0)}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card padding="lg">
              <h3 className="text-xl font-semibold text-text mb-4">Categorias - Contas a Pagar</h3>
              <ResponsiveContainer width="100%" height={300} className="h-64 md:h-80">
                <BarChart data={categoriaPagar} aria-label="Gráfico de categorias de contas a pagar">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="categoria" 
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
                  <Bar 
                    dataKey="total" 
                    fill="var(--color-danger)"
                    name="Total"
                    aria-label="Total por categoria"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card padding="lg">
              <h3 className="text-xl font-semibold text-text mb-4">Categorias - Contas a Receber</h3>
              <ResponsiveContainer width="100%" height={300} className="h-64 md:h-80">
                <BarChart data={categoriaReceber} aria-label="Gráfico de categorias de contas a receber">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="categoria" 
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
                  <Bar 
                    dataKey="total" 
                    fill="var(--color-success)"
                    name="Total"
                    aria-label="Total por categoria"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
