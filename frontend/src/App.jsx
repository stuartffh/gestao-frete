import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingPage } from './components/ui/Loading';
import Login from './pages/Login';

// Lazy loading de rotas secundárias
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotasFiscais = lazy(() => import('./pages/NotasFiscais'));
const NovaNota = lazy(() => import('./pages/NovaNota'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const ContasPagar = lazy(() => import('./pages/ContasPagar'));
const ContasReceber = lazy(() => import('./pages/ContasReceber'));
const Pagamentos = lazy(() => import('./pages/Pagamentos'));
const RelatoriosFinanceiro = lazy(() => import('./pages/RelatoriosFinanceiro'));
const Cadastros = lazy(() => import('./pages/Cadastros'));
const Viagens = lazy(() => import('./pages/Viagens'));
const ViagensKanban = lazy(() => import('./pages/ViagensKanban'));
const Parcelas = lazy(() => import('./pages/Parcelas'));
const Caixa = lazy(() => import('./pages/Caixa'));
const Importacao = lazy(() => import('./pages/Importacao'));
const Conciliacao = lazy(() => import('./pages/Conciliacao'));
const Alertas = lazy(() => import('./pages/Alertas'));
const Inteligencia = lazy(() => import('./pages/Inteligencia'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={
          <Suspense fallback={<LoadingPage />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="notas" element={
          <Suspense fallback={<LoadingPage />}>
            <NotasFiscais />
          </Suspense>
        } />
        <Route path="notas/nova" element={
          <Suspense fallback={<LoadingPage />}>
            <NovaNota />
          </Suspense>
        } />
        <Route path="notas/:id" element={
          <Suspense fallback={<LoadingPage />}>
            <NovaNota />
          </Suspense>
        } />
        <Route path="relatorios" element={
          <Suspense fallback={<LoadingPage />}>
            <Relatorios />
          </Suspense>
        } />
        
        {/* Rotas protegidas - Módulo Financeiro */}
        <Route
          path="contas-pagar"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <ContasPagar />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="contas-receber"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <ContasReceber />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="pagamentos"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Pagamentos />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="relatorios-financeiro"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <RelatoriosFinanceiro />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="cadastros"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Cadastros />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="viagens"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Viagens />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="viagens/kanban"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <ViagensKanban />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="parcelas"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Parcelas />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="caixa"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Caixa />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="importacao"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Importacao />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="conciliacao"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Conciliacao />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="alertas"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Alertas />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="inteligencia"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Inteligencia />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="configuracoes"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingPage />}>
                <Configuracoes />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;

