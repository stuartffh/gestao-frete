import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from './ui/Input';
import Button from './ui/Button';
import { cn } from '../lib/utils';

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  // Rotas que permitem criação rápida
  const quickCreateRoutes = {
    '/notas': '/notas/nova',
    '/cadastros': null, // Modal no próprio componente
    '/viagens': null, // Modal no próprio componente
    '/contas-pagar': '/contas-pagar/nova',
    '/contas-receber': '/contas-receber/nova',
  };

  const canCreate = Object.keys(quickCreateRoutes).some(route => 
    location.pathname.startsWith(route)
  );

  const handleQuickCreate = () => {
    const route = Object.entries(quickCreateRoutes).find(([base]) => 
      location.pathname.startsWith(base)
    );
    
    if (route) {
      const [, target] = route;
      if (target) {
        navigate(target);
      } else {
        // Disparar evento para abrir modal (será capturado pelo componente da página)
        window.dispatchEvent(new CustomEvent('quick-create'));
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implementar busca global (pode redirecionar para página de busca)
    if (searchTerm.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="sticky top-0 z-sticky bg-card border-b border-border px-4 md:px-8 py-3">
      <div className="flex items-center gap-4">
        {/* Busca Global */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Buscar em todo o sistema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={Search}
            className="w-full"
          />
        </form>

        {/* Botão Criar Rápido */}
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={handleQuickCreate}
            title="Criar novo (ou pressione 'n')"
          >
            Criar
          </Button>
        )}
      </div>
    </div>
  );
};

export default Topbar;

