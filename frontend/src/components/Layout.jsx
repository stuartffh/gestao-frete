import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, DollarSign, ArrowLeftRight, Receipt, LogOut, Wallet, Users, Truck, Calendar, Coins, Upload, Link2, Bell, Menu, X, Sun, Moon, Search, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import { useEffect, useState, useRef } from 'react';
import { getAlertasNaoLidos } from '../api/alertas';
import Topbar from './Topbar';

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [alertasNaoLidos, setAlertasNaoLidos] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchInputRef = useRef(null);
  const filterButtonRef = useRef(null);

  useEffect(() => {
    if (user) {
      const carregarAlertas = async () => {
        try {
          const response = await getAlertasNaoLidos();
          setAlertasNaoLidos(response.count || 0);
        } catch (error) {
          console.error('Erro ao carregar alertas:', error);
        }
      };
      carregarAlertas();
      // Atualizar a cada 30 segundos
      const interval = setInterval(carregarAlertas, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Atalhos de teclado globais
  useKeyboardShortcuts({
    '/': () => {
      // Focar na busca (se houver campo de busca na página)
      const searchInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
      for (const input of searchInputs) {
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
        if (placeholder.includes('buscar') || placeholder.includes('search')) {
          input.focus();
          break;
        }
      }
    },
    'n': () => {
      // Criar novo item - procurar links ou botões com texto "Novo" ou "Criar"
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const newButton = buttons.find(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        return (text.includes('novo') || text.includes('criar')) && 
               (btn.href?.includes('/nova') || btn.href?.includes('/novo') || text.includes('nova'));
      });
      if (newButton) {
        newButton.click();
      }
    },
    'f': () => {
      // Focar nos filtros - procurar selects ou inputs de filtro
      const selects = document.querySelectorAll('select');
      if (selects.length > 0) {
        selects[0].focus();
      }
    },
  });

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/notas', label: 'Notas Fiscais', icon: FileText },
    { path: '/cadastros', label: 'Cadastros', icon: Users, requiresAuth: true },
    { path: '/viagens', label: 'Viagens', icon: Truck, requiresAuth: true },
    { path: '/contas-pagar', label: 'Contas a Pagar', icon: DollarSign, requiresAuth: true },
    { path: '/contas-receber', label: 'Contas a Receber', icon: Receipt, requiresAuth: true },
    { path: '/parcelas', label: 'Parcelas', icon: Calendar, requiresAuth: true },
    { path: '/pagamentos', label: 'Pagamentos', icon: ArrowLeftRight, requiresAuth: true },
    { path: '/caixa', label: 'Caixa', icon: Coins, requiresAuth: true },
    { path: '/importacao', label: 'Importação', icon: Upload, requiresAuth: true },
    { path: '/conciliacao', label: 'Conciliação', icon: Link2, requiresAuth: true },
    { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    { path: '/relatorios-financeiro', label: 'Rel. Financeiro', icon: Wallet, requiresAuth: true },
  ].filter(item => !item.requiresAuth || user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-modal md:hidden bg-card border border-border rounded-lg p-2 text-text hover:bg-surface transition-colors"
        aria-label={sidebarOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
        aria-expanded={sidebarOpen}
        aria-controls="sidebar-navigation"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        id="sidebar-navigation"
        aria-label="Menu de navegação principal"
        className={`fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-sticky transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex-1">
          <h1 className="text-2xl font-bold text-text mb-8">
            Gestão Frete
          </h1>
          <nav className="space-y-2" aria-label="Navegação principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                              (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-muted hover:bg-card hover:text-text'
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {user && (
          <div className="p-4 border-t border-border space-y-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-text">{user.username}</p>
                <p className="text-xs text-muted">{user.role}</p>
              </div>
              <div className="flex items-center gap-2">
                {alertasNaoLidos > 0 && (
                  <Link
                    to="/alertas"
                    className="relative p-2 hover:bg-card rounded-lg transition-colors"
                    aria-label={`${alertasNaoLidos} alerta${alertasNaoLidos > 1 ? 's' : ''} não lido${alertasNaoLidos > 1 ? 's' : ''}`}
                  >
                    <Bell size={18} className="text-muted" aria-hidden="true" />
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-hidden="true">
                      {alertasNaoLidos > 9 ? '9+' : alertasNaoLidos}
                    </span>
                  </Link>
                )}
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-card rounded-lg transition-colors text-muted hover:text-text"
                  title={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
                  aria-label="Alternar tema"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-muted hover:bg-card hover:text-danger rounded-lg transition-colors"
              aria-label="Sair do sistema"
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        )}
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-dropdown md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSidebarOpen(false);
            }
          }}
        />
      )}

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen" aria-label="Conteúdo principal">
        <Topbar />
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

