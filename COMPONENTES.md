# 📚 Guia de Componentes - Gestão Frete

Documentação completa de todos os componentes UI do sistema.

---

## 🎨 Design System

Baseado no arquivo `tema.md` com 100% de conformidade WCAG AA.

### Design Tokens (CSS Variables)

Todas as cores, espaçamentos e outros valores estão definidos como CSS variables em `frontend/src/index.css`:

```css
--color-bg, --color-surface, --color-card
--color-text, --color-muted, --color-border
--color-primary, --color-success, --color-warning, --color-danger
--radius-xs, --radius-sm, --radius-md, --radius-lg
--shadow-sm, --shadow-md, --shadow-lg
```

---

## 🧩 Componentes Base

### Button

**Localização:** `frontend/src/components/ui/Button.jsx`

```jsx
import Button from '../components/ui/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  <Icon size={18} />
  Salvar
</Button>
```

**Props:**
- `variant`: `primary` | `secondary` | `subtle` | `ghost` | `danger` | `outline`
- `size`: `sm` | `md` | `lg`
- `disabled`: boolean
- `loading`: boolean (mostra spinner)
- `as`: componente customizado (ex: Link do React Router)

---

### Input

**Localização:** `frontend/src/components/ui/Input.jsx`

```jsx
import Input from '../components/ui/Input';

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="Digite um email válido"
  required
/>
```

**Props:**
- `label`: string
- `type`: text | email | password | number | tel
- `error`: string (mensagem de erro)
- `helperText`: string
- `leftIcon`, `rightIcon`: componente React
- `validateOnBlur`: boolean
- `validator`: função (value => errorMessage | null)

---

### Card

**Localização:** `frontend/src/components/ui/Card.jsx`

```jsx
import Card from '../components/ui/Card';

<Card>
  <Card.Header>
    <Card.Title>Título</Card.Title>
    <Card.Description>Descrição</Card.Description>
  </Card.Header>
  <Card.Content>
    Conteúdo aqui
  </Card.Content>
  <Card.Footer>
    <Button>Ação</Button>
  </Card.Footer>
</Card>
```

---

### Modal

**Localização:** `frontend/src/components/ui/Modal.jsx`

```jsx
import Modal from '../components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmação"
>
  <p>Tem certeza?</p>
  <div className="flex gap-2 mt-4">
    <Button onClick={handleConfirm}>Confirmar</Button>
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancelar
    </Button>
  </div>
</Modal>
```

**Features:**
- Fecha com ESC
- Focus trap automático
- Backdrop clicável
- Acessibilidade (role="dialog", aria-modal)

---

### Badge

**Localização:** `frontend/src/components/ui/Badge.jsx`

```jsx
import Badge from '../components/ui/Badge';

<Badge variant="success">Pago</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="danger">Vencido</Badge>
```

**Variants:** `default` | `primary` | `success` | `warning` | `danger` | `info`

---

### Tabs

**Localização:** `frontend/src/components/ui/Tabs.jsx`

```jsx
import Tabs from '../components/ui/Tabs';

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Conteúdo 1</Tabs.Content>
  <Tabs.Content value="tab2">Conteúdo 2</Tabs.Content>
</Tabs>
```

---

### DataTable

**Localização:** `frontend/src/components/ui/DataTable.jsx`

```jsx
import DataTable from '../components/ui/DataTable';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  {
    key: 'valor',
    label: 'Valor',
    render: (row) => formatMoney(row.valor)
  },
];

<DataTable
  data={data}
  columns={columns}
  onSort={handleSort}
  sortConfig={sortConfig}
/>
```

---

## 🚀 Componentes Avançados

### VirtualTable

**Localização:** `frontend/src/components/ui/VirtualTable.jsx`

Para listas com > 100 itens. Renderiza apenas linhas visíveis.

```jsx
import VirtualTable from '../components/ui/VirtualTable';

<VirtualTable
  data={largeDataset}
  columns={columns}
  rowHeight={60}
  overscan={5}
/>
```

---

### ResponsiveTable

**Localização:** `frontend/src/components/ui/ResponsiveTable.jsx`

Tabela em desktop, cards em mobile.

```jsx
import ResponsiveTable from '../components/ui/ResponsiveTable';

<ResponsiveTable
  data={data}
  columns={columns.map(col => ({
    ...col,
    mobileLabel: col.label.substr(0, 10) // Label curto para mobile
  }))}
/>
```

---

### Wizard

**Localização:** `frontend/src/components/ui/Wizard.jsx`

Formulários multipasso com barra de progresso.

```jsx
import Wizard, { useWizard } from '../components/ui/Wizard';

<Wizard onComplete={handleComplete} onCancel={handleCancel}>
  <Wizard.Step title="Dados Básicos">
    <FormStep1 />
  </Wizard.Step>
  <Wizard.Step title="Endereço">
    <FormStep2 />
  </Wizard.Step>
  <Wizard.Step title="Confirmação">
    <FormStep3 />
  </Wizard.Step>
</Wizard>

// Dentro de um step:
function FormStep1() {
  const { updateStepData, nextStep } = useWizard();

  const handleNext = () => {
    updateStepData('nome', nome);
    nextStep();
  };
}
```

---

### KanbanBoard

**Localização:** `frontend/src/components/KanbanBoard.jsx`

Quadro Kanban com drag & drop.

```jsx
import KanbanBoard from '../components/KanbanBoard';

const columns = [
  { id: 'todo', title: 'A Fazer', items: [...] },
  { id: 'doing', title: 'Fazendo', items: [...] },
  { id: 'done', title: 'Concluído', items: [...] },
];

<KanbanBoard
  columns={columns}
  onDragEnd={(item, fromColumn, toColumn) => {
    console.log(`${item.id} movido de ${fromColumn} para ${toColumn}`);
  }}
  renderCard={(item) => (
    <div>
      <h4>{item.title}</h4>
      <p>{item.description}</p>
    </div>
  )}
/>
```

---

### LazyChart

**Localização:** `frontend/src/components/LazyChart.jsx`

Gráficos com lazy loading automático.

```jsx
import LazyChart from '../components/LazyChart';

<LazyChart
  type="line"
  data={chartData}
  dataKey="valor"
  xAxisKey="mes"
  height="h-80"
/>

// Tipos: 'line', 'bar', 'pie', 'area'
```

---

## 🎣 Hooks Personalizados

### useAutoSave

**Localização:** `frontend/src/hooks/useAutoSave.js`

```jsx
import useAutoSave from '../hooks/useAutoSave';

const [formData, setFormData] = useState({});
const { lastSaved, clearSaved } = useAutoSave(
  'meu-form-rascunho',
  formData,
  2000 // delay em ms
);

return (
  <div>
    {lastSaved && (
      <span>Salvo às {lastSaved.toLocaleTimeString()}</span>
    )}
    <Button onClick={clearSaved}>Limpar Rascunho</Button>
  </div>
);
```

---

### usePerformanceMetrics

**Localização:** `frontend/src/hooks/usePerformanceMetrics.js`

```jsx
import usePerformanceMetrics from '../hooks/usePerformanceMetrics';

// Em modo dev, loga automaticamente no console
usePerformanceMetrics(true);

// Com callback customizado
usePerformanceMetrics(true, (metric) => {
  // Enviar para analytics
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  });
});
```

---

### useKeyboardShortcuts

**Localização:** `frontend/src/hooks/useKeyboardShortcuts.js`

```jsx
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

useKeyboardShortcuts({
  '/': () => searchInputRef.current?.focus(),
  'n': () => navigate('/nova'),
  'Escape': () => setModalOpen(false),
});
```

---

### useTableDensity

**Localização:** `frontend/src/hooks/useTableDensity.js`

```jsx
import useTableDensity from '../hooks/useTableDensity';

const { density, setDensity } = useTableDensity();

<Select value={density} onChange={(e) => setDensity(e.target.value)}>
  <option value="comfortable">Confortável</option>
  <option value="compact">Compacta</option>
</Select>
```

---

## 🎨 Utilitários

### formatMoney

```jsx
import { formatMoney } from '../lib/utils';

formatMoney(1234.56); // "R$ 1.234,56"
```

### formatDate

```jsx
import { formatDate } from '../lib/utils';

formatDate('2025-01-15'); // "15/01/2025"
formatDate(new Date());    // Data atual formatada
```

### cn (Class Names)

```jsx
import { cn } from '../lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)} />
```

---

## 🎭 Componentes de Layout

### Layout

**Localização:** `frontend/src/components/Layout.jsx`

Layout principal com sidebar, topbar e conteúdo.

**Features:**
- Sidebar colapsável em mobile
- Badge de alertas não lidos
- Toggle de tema (dark/light)
- Atalhos de teclado globais
- Landmarks ARIA completos

---

### Topbar

**Localização:** `frontend/src/components/Topbar.jsx`

Barra superior com busca global e botão de ação rápida.

---

### Breadcrumbs

**Localização:** `frontend/src/components/Breadcrumbs.jsx`

```jsx
import Breadcrumbs from '../components/Breadcrumbs';

<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Viagens', href: '/viagens' },
    { label: 'Detalhes' },
  ]}
/>
```

---

### DetailLayout

**Localização:** `frontend/src/components/DetailLayout.jsx`

Layout padrão para páginas de detalhe com tabs (Resumo | Anexos | Histórico).

```jsx
import DetailLayout from '../components/DetailLayout';

<DetailLayout title="Viagem #123">
  <DetailLayout.Tab value="resumo" label="Resumo">
    Conteúdo do resumo
  </DetailLayout.Tab>
  <DetailLayout.Tab value="anexos" label="Anexos">
    Lista de anexos
  </DetailLayout.Tab>
</DetailLayout>
```

---

## 📱 Responsividade

### Breakpoints

```css
sm: 640px   /* Mobile grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeno */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

### Padrões Responsivos

```jsx
// Ocultar em mobile
<div className="hidden md:block">Desktop only</div>

// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Espaçamento responsivo
<div className="p-4 md:p-8">

// Texto responsivo
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

---

## 🖨️ Impressão

Os estilos de impressão estão em `frontend/src/styles/print.css`.

**Classes úteis:**
- `.no-print` - Oculta elemento na impressão
- `.print-only` - Exibe apenas na impressão
- `.page-break` - Força quebra de página
- `.avoid-break` - Evita quebra dentro do elemento

---

## ♿ Acessibilidade

Todos os componentes seguem **WCAG 2.1 Nível AA**.

### Padrões Implementados

- Contraste mínimo 4.5:1 (texto normal)
- Navegação por teclado completa
- Landmarks ARIA (`<nav>`, `<main>`, `<aside>`)
- Labels descritivos (aria-label, aria-describedby)
- Estados de foco visíveis
- Screen reader friendly

### Validação

```bash
cd frontend
npm run check-contrast  # Valida contraste de cores
npm run lint            # Valida regras jsx-a11y
```

Ver `ACESSIBILIDADE.md` para detalhes completos.

---

## 🎯 Boas Práticas

### 1. Composição > Props Booleanas

```jsx
// ❌ Ruim
<Button primary large disabled />

// ✅ Bom
<Button variant="primary" size="lg" disabled />
```

### 2. Ícones com aria-hidden

```jsx
// ✅ Sempre marcar ícones decorativos
<Icon size={18} aria-hidden="true" />

// ✅ Ícones funcionais com aria-label no botão
<button aria-label="Fechar">
  <X size={18} aria-hidden="true" />
</button>
```

### 3. Loading States

```jsx
<Button disabled={loading} aria-busy={loading}>
  {loading ? 'Salvando...' : 'Salvar'}
</Button>
```

### 4. Formulários Acessíveis

```jsx
<div>
  <label htmlFor="email">Email</label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : "email-help"}
  />
  {error && <span id="email-error" role="alert">{error}</span>}
  {!error && <span id="email-help">Digite seu email</span>}
</div>
```

---

## 📦 Estrutura de Pastas

```
frontend/src/
├── components/
│   ├── ui/              # Componentes base reutilizáveis
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── DataTable.jsx
│   │   ├── VirtualTable.jsx
│   │   ├── ResponsiveTable.jsx
│   │   ├── Wizard.jsx
│   │   └── ...
│   ├── Layout.jsx       # Layout principal
│   ├── Topbar.jsx
│   ├── Breadcrumbs.jsx
│   ├── KanbanBoard.jsx
│   └── LazyChart.jsx
├── pages/               # Páginas/rotas
├── hooks/               # Custom hooks
├── lib/                 # Utilitários
├── contexts/            # Contextos React
├── api/                 # Chamadas API
└── styles/              # Estilos globais
```

---

## 🎨 Micro-Interações

O sistema inclui micro-interações avançadas para melhorar a UX.

### useRipple Hook

```jsx
import useRipple from '../hooks/useRipple';

const createRipple = useRipple();

<button
  className="ripple-container"
  onClick={(e) => {
    createRipple(e);
    handleClick();
  }}
>
  Clique aqui
</button>
```

**Nota:** O Button já implementa ripple automaticamente!

### SuccessCheckmark

```jsx
import SuccessCheckmark from '../components/ui/SuccessCheckmark';

<SuccessCheckmark size={64} />
```

### Animações CSS Disponíveis

```jsx
// Hover effects
<div className="hover-lift">Elemento</div>
<div className="hover-glow">Elemento</div>

// Loading
<div className="skeleton-shimmer">Loading...</div>
<div className="pulse-glow">Loading...</div>

// Success/Error
<div className="success-checkmark">✓</div>
<div className="shake-error">Erro!</div>

// Slide
<div className="slide-in-right">Conteúdo</div>
<div className="slide-in-up">Conteúdo</div>

// Bounce
<div className="bounce-in">Conteúdo</div>
<div className="wiggle">Conteúdo</div>

// Button
<button className="button-press ripple-container">Clique</button>

// Stagger (listas)
<li className="stagger-item">Item 1</li>
<li className="stagger-item">Item 2</li>

// Card interativo
<Card interactive onClick={handleClick}>
  Card com hover effect
</Card>

// Badge pulsante
<span className="badge-pulse">3</span>
```

**Ver `MICRO_INTERACOES.md` para documentação completa.**

---

## 🔗 Referências

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [@tanstack/react-virtual](https://tanstack.com/virtual/v3)
- [Material Design Motion](https://material.io/design/motion)

---

**Última atualização:** 2025-11-02
**Versão:** 1.1.0 (com micro-interações)
**Compatibilidade:** React 18+, Tailwind CSS 3+
