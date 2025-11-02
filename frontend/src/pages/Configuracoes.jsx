import { useState } from 'react';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { Settings, Users, Tag, Building, Layout, Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import useTableDensity from '../hooks/useTableDensity';

export default function Configuracoes() {
  const { theme, toggleTheme } = useTheme();
  const { density, setDensity } = useTableDensity();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('usuarios');

  // Mock data
  const [usuarios] = useState([
    { id: 1, username: 'admin', email: 'admin@empresa.com', role: 'admin', ativo: true },
    { id: 2, username: 'financeiro', email: 'financeiro@empresa.com', role: 'financeiro', ativo: true },
    { id: 3, username: 'operador', email: 'operador@empresa.com', role: 'operador', ativo: false },
  ]);

  const [categorias] = useState([
    { id: 1, nome: 'Combust\u00edvel', tipo: 'despesa', cor: '#ef4444' },
    { id: 2, nome: 'Manuten\u00e7\u00e3o', tipo: 'despesa', cor: '#f59e0b' },
    { id: 3, nome: 'Frete', tipo: 'receita', cor: '#22c55e' },
    { id: 4, nome: 'Servi\u00e7os', tipo: 'receita', cor: '#38bdf8' },
  ]);

  const [centrosCusto] = useState([
    { id: 1, codigo: 'VEI01', nome: 'Ve\u00edculo 01', descricao: 'Caminh\u00e3o Mercedes 1620' },
    { id: 2, codigo: 'VEI02', nome: 'Ve\u00edculo 02', descricao: 'Caminh\u00e3o Volvo FH' },
    { id: 3, codigo: 'ADM', nome: 'Administrativo', descricao: 'Despesas administrativas gerais' },
  ]);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'financeiro':
        return 'primary';
      case 'operador':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-3">
            <Settings className="text-primary" size={32} />
            Configura\u00e7\u00f5es
          </h1>
          <p className="text-muted mt-1">
            Gerencie usu\u00e1rios, categorias, centros de custo e prefer\u00eancias
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="usuarios">
            <Users size={18} />
            Usu\u00e1rios
          </Tabs.Trigger>
          <Tabs.Trigger value="categorias">
            <Tag size={18} />
            Categorias
          </Tabs.Trigger>
          <Tabs.Trigger value="centros-custo">
            <Building size={18} />
            Centros de Custo
          </Tabs.Trigger>
          <Tabs.Trigger value="layout">
            <Layout size={18} />
            Prefer\u00eancias
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab: Usu\u00e1rios e RBAC */}
        <Tabs.Content value="usuarios">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title>Usu\u00e1rios e Permiss\u00f5es</Card.Title>
                  <Card.Description>
                    Gerencie usu\u00e1rios e suas permiss\u00f5es (RBAC)
                  </Card.Description>
                </div>
                <Button>
                  <Plus size={18} />
                  Novo Usu\u00e1rio
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {usuarios.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-text">{user.username}</h4>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                        {!user.ativo && <Badge variant="default">Inativo</Badge>}
                      </div>
                      <p className="text-sm text-muted mt-1">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="danger" size="sm">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </Tabs.Content>

        {/* Tab: Categorias */}
        <Tabs.Content value="categorias">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title>Categorias</Card.Title>
                  <Card.Description>
                    Gerencie categorias de receitas e despesas
                  </Card.Description>
                </div>
                <Button>
                  <Plus size={18} />
                  Nova Categoria
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cat.cor }}
                        aria-label={`Cor da categoria ${cat.nome}`}
                      />
                      <div>
                        <h4 className="font-medium text-text">{cat.nome}</h4>
                        <p className="text-xs text-muted">
                          {cat.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="danger" size="sm">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </Tabs.Content>

        {/* Tab: Centros de Custo */}
        <Tabs.Content value="centros-custo">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title>Centros de Custo</Card.Title>
                  <Card.Description>
                    Gerencie centros de custo para rastreamento financeiro
                  </Card.Description>
                </div>
                <Button>
                  <Plus size={18} />
                  Novo Centro
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {centrosCusto.map((centro) => (
                  <div
                    key={centro.id}
                    className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{centro.codigo}</Badge>
                        <h4 className="font-medium text-text">{centro.nome}</h4>
                      </div>
                      <p className="text-sm text-muted mt-1">{centro.descricao}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="danger" size="sm">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </Tabs.Content>

        {/* Tab: Prefer\u00eancias de Layout */}
        <Tabs.Content value="layout">
          <Card>
            <Card.Header>
              <Card.Title>Prefer\u00eancias de Layout</Card.Title>
              <Card.Description>
                Personalize a apar\u00eancia e densidade da interface
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="space-y-6">
                {/* Tema */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Tema
                  </label>
                  <Select
                    value={theme}
                    onChange={(e) => {
                      if (e.target.value !== theme) {
                        toggleTheme();
                      }
                    }}
                  >
                    <option value="dark">Modo Escuro</option>
                    <option value="light">Modo Claro</option>
                  </Select>
                  <p className="text-xs text-muted mt-1">
                    Altere entre modo escuro e claro
                  </p>
                </div>

                {/* Densidade das Tabelas */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Densidade das Tabelas
                  </label>
                  <Select
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                  >
                    <option value="comfortable">Confort\u00e1vel (padr\u00e3o)</option>
                    <option value="compact">Compacta</option>
                  </Select>
                  <p className="text-xs text-muted mt-1">
                    Ajuste o espa\u00e7amento vertical nas tabelas
                  </p>
                </div>

                {/* Salvar */}
                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={() => addToast('Prefer\u00eancias salvas!', 'success')}
                  >
                    Salvar Prefer\u00eancias
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        </Tabs.Content>
      </Tabs>
    </div>
  );
}
