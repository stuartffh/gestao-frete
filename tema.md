GUIA DE TEMA, LAYOUT E DESIGN SYSTEM
Versão: 1.0

====================================================================
1) PRINCÍPIOS DE DESIGN
====================================================================
- Profissional e confiável: foco em clareza, hierarquia visual e legibilidade.
- Dark-first: o modo escuro é padrão; o modo claro é opcional e pode surgir depois.
- Mínimo ruído: evite bordas pesadas; prefira sombras suaves e contrastes controlados.
- Densidade ajustável: tabelas e cards com 2 densidades: "comfortable" e "compact".
- Escalável: tudo baseado em "design tokens" e CSS variables (facilita branding futuro).
- Consistência: ícones, espaçamentos, tipografia e estados seguem padrões definidos aqui.
- Acessível: contraste AA, foco visível, navegação por teclado, ARIA e feedback textual.
- Performance: evite overdraw, imagens pesadas, re-render desnecessário; lazy-loading.

====================================================================
2) DESIGN TOKENS (CSS VARIABLES + TAILWIND THEME)
====================================================================
Nomes de tokens (CSS variables), definidos no :root (modo light) e .dark (modo dark).

Cores (paleta base, personalizável no futuro):
--color-bg:           #0f172a     (Slate-900)   // background principal (dark)
--color-surface:      #111827     (Slate-900+)  // superfícies profundas
--color-card:         #1f2937     (Slate-800)   // cartões e painéis
--color-muted:        #94a3b8     (Slate-400)   // textos secundários
--color-text:         #e5e7eb     (Slate-200)   // texto primário
--color-border:       #334155     (Slate-700)   // bordas suaves
--color-primary:      #38bdf8     (Sky-400)     // acento/ações
--color-primary-600:  #0284c7     (Sky-600)     // hover/active
--color-success:      #22c55e     (Green-500)   // sucesso
--color-warning:      #f59e0b     (Amber-500)   // atenção
--color-danger:       #ef4444     (Red-500)     // erro
--color-info:         #60a5fa     (Blue-400)    // informação

Radii:
--radius-xs: 0.375rem  (rounded-md)
--radius-sm: 0.5rem    (rounded-lg)
--radius-md: 0.75rem   (rounded-xl)
--radius-lg: 1rem      (rounded-2xl)

Sombras (usar parcimoniosamente):
--shadow-sm: 0 1px 2px 0 rgba(0,0,0,.25)
--shadow-md: 0 4px 10px -2px rgba(0,0,0,.35)
--shadow-lg: 0 10px 30px -10px rgba(0,0,0,.5)

Tipografia:
--font-sans: ui-sans-serif, system-ui, Segoe UI, Roboto, Inter, Arial, sans-serif
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace

Espaçamentos escala (Tailwind spacing):
2 (0.5rem), 3 (0.75rem), 4 (1rem), 6 (1.5rem), 8 (2rem), 10 (2.5rem), 12 (3rem)

Z‑index (camadas):
--z-base: 1, --z-sticky: 10, --z-dropdown: 50, --z-modal: 100, --z-toast: 1000

Estados e Opacidades:
hover: opacidade + leve elevação; focus: anel de foco visível com primary-400; disabled: opacidade .5 e cursor-not-allowed.

====================================================================
3) TAILWIND: BASE E EXTENSÕES
====================================================================
- Configurar Tailwind para consumir CSS variables: theme.extend.colors via function.
- Habilitar plugin de tipografia (opcional) e forms (para estilizar inputs coerentes).
- Classe global: .dark no <html> (dark-first).

Exemplo de extensão (pseudocódigo):
theme.extend.colors = {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  card: "var(--color-card)",
  text: "var(--color-text)",
  muted: "var(--color-muted)",
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  border: "var(--color-border)"
}
theme.extend.borderRadius = { md: "var(--radius-md)", ... }
theme.extend.boxShadow = { md: "var(--shadow-md)", lg: "var(--shadow-lg)" }

====================================================================
4) GRID, LAYOUTS E BREAKPOINTS
====================================================================
Breakpoints (Tailwind padrão): sm (640), md (768), lg (1024), xl (1280), 2xl (1536).
Container: max-w-7xl nas páginas principais; padding x: 4 (mobile) a 8 (desktop).

Layouts canônicos:
[A] Dashboard principal:
- Sidebar fixa à esquerda (colapsável em md-), topo com breadcrumbs, busca e avatar.
- Conteúdo em grid 12 col: cards KPI (3/6/12 cols em sm/md/lg), gráficos abaixo, tabelas em abas.
[B] Listagem (NF, pagar/receber, viagens):
- Header com título + filtros + ações (Novo, Exportar). Tabela responsiva com sticky header.
[C] Detalhe de registro:
- Cabeçalho com metadados + ações (Editar, Excluir, Duplicar). Tabs: Resumo | Anexos | Histórico.
[D] Formulários multipasso (wizard) com passos colapsáveis em mobile e barra de progresso.

Comportamento responsivo:
- Sidebar vira Drawer em telas < md, acionado por botão hambúrguer.
- Tabelas: alternar para “cards empilhados” em sm, exibindo campos chave.
- Gráficos: altura adaptativa (h-64 mobile, h-80 desktop), legendas empilhadas no mobile.

====================================================================
5) NAVEGAÇÃO E IAUX
====================================================================
- Sidebar com seções: Dashboard, Notas, Financeiro, Viagens, Inteligência (IA), Relatórios, Configurações.
- Topbar: breadcrumbs, busca global (/), botão de criar rápido (+), perfil.
- Atalhos: "/" (foco busca), "n" (novo), "f" (filtros), "?" (ajuda).
- Estados vazios com call-to-action e ilustrações minimalistas (linhas, shapes).

Breadcrumbs:
Home / [Módulo] / [Página atual]

====================================================================
6) COMPONENTES (shadcn/ui + utilitários)
====================================================================
Botões (Button):
- Variantes: primary, secondary, subtle, ghost, danger, outline.
- Tamanhos: sm, md, lg; ícone à esquerda/direita; loading state com spinner.
- Regra: botões primários por tela devem ser únicos em destaque.

Inputs (TextField, Number, Masked):
- Estados: default, focus, error, disabled; ajuda/descrição abaixo do campo; máscara para CNPJ/CPF, data, moeda.

Select/Combobox com busca, multi-select para categorias, chips removíveis.

Badges: status (aberto/parcial/quitado/cancelado, pago/pendente), tons suaves com texto legível.

Cards: radius md/lg, shadow-md, borda sutil (border-border).

Tabelas (DataTable):
- Colunas configuráveis, sort, filtro por coluna, densidade (comfortable/compact), paginação, “Ações” por linha.
- Linha com hover e seleção (checkbox).

Uploads (Dropzone):
- Arrastar‑e‑soltar com preview; aceita PDF/JPG/PNG; barra de progresso e mensagens de erro claras.

Modais/Drawers:
- Confirmar ações destrutivas, formulários rápidos (ex.: liquidação). Esc curto: Esc = fechar, Enter = confirmar.

Toasts/Notifications:
- Sucesso, erro, info; durações distintas (erro > sucesso).

Tabs e Accordion para detalhes/relatórios.

Tooltips com delay curto; conteúdo não essencial.

====================================================================
7) ESTADOS, ERROS E FEEDBACK
====================================================================
- Loading: skeleton ou shimmer; botões mostram spinner e ficam disabled.
- Empty: mensagem contextual + CTA (ex.: “Importar CSV”).
- Error: título, descrição resumida, botão “Tentar novamente” + “Ver detalhes” (expansível).
- Sucesso: feedback imediato + toast + opcional highlight no card criado.
- Acessibilidade: mensagens de erro associadas via aria‑describedby.

====================================================================
8) TIPOGRAFIA E ESCALAS
====================================================================
Escala (rem):
- Display: 2.25rem/700
- H1: 1.875rem/700
- H2: 1.5rem/700
- H3: 1.25rem/600
- Body: 1rem/400
- Small: 0.875rem/500
- Mono (códigos/IDs): 0.875rem/500 com --font-mono.

Títulos curtos e descritivos; subtítulos com cor muted; números sempre alinhados à direita em tabelas numéricas.

====================================================================
9) ÍCONES E ILUSTRAÇÕES
====================================================================
- Ícones: lucide-react; tamanho 18/20/24px conforme densidade.
- Usar ícones apenas quando agregarem significado; juntos de labels.
- Ilustrações minimalistas vetoriais nos estados vazios/erros (sem fotos de banco de imagem).

====================================================================
10) GRÁFICOS (Recharts)
====================================================================
- Tipos: Linha (evolução mensal), Barras (categorias), Pizza (status).
- Legendas claras, tooltips com valores formatados (R$, datas).
- Cores: usar var(--color-primary) para traços principais; usar paleta derivada (alpha/claridade) para séries secundárias.
- Acessibilidade: descrição aria da finalidade do gráfico, tabIndex para pontos importantes (se possível).

====================================================================
11) FORMULÁRIOS (Padrões de UX)
====================================================================
- Alinhamento vertical; rótulos acima dos campos; grupos lógicos em cards.
- Validação onBlur e onSubmit; mensagens claras ("Informe um CNPJ válido").
- Botões: "Salvar" (primary) à direita; "Cancelar" (ghost) à esquerda.
- Auto‑save opcional em notas longas com rascunho (localStorage).

====================================================================
12) ACESSIBILIDADE (WCAG AA)
====================================================================
- Contraste mínimo 4.5:1 para texto normal; 3:1 para headers grandes.
- Foco visível (outline com primary-400); ordem de tab natural.
- ARIA roles em navegação, tabelas, modais; aria-live para toasts.
- Suporte a leitor de tela: labels, alt text em imagens/ícones relevantes.

====================================================================
13) MOTION (ANIMAÇÕES)
====================================================================
- Micro‑interações: hover eleva shadow, focus realça outline.
- Transições: 150–200ms ease‑in‑out para opacidade/transform.
- Evitar animações grandes no mobile; respeitar prefers-reduced-motion.

====================================================================
14) MODO CLARO (OPCIONAL)
====================================================================
- Defina um set claro (tokens invertidos): bg #f8fafc, text #0f172a, card #ffffff, border #e2e8f0.
- Mantém a mesma hierarquia e pesos; contraste mínimo AA.
- Toggle no menu do usuário; preferência salva (localStorage + media query).

====================================================================
15) PÁGINAS PRINCIPAIS E BLOCOS
====================================================================
Dashboard:
- 4 KPIs: Receita, Despesa, Lucro, Custo/km (cards com ícone sutil, número grande, delta %).
- Gráficos: Receita vs Despesa (linha), Despesa por categoria (barras), Status financeiro (pizza).
- Lista "Últimas ações" (auditoria) e "Alertas da IA".

Notas Fiscais:
- Listagem com filtros (período, cliente, status, valor). Ações em massa (exportar, categoria).
- Detalhe: metadados + preview do PDF e foto; OCR e campos extraídos; histórico.

Financeiro (Pagar/Receber):
- Tabela com status/badges; ações rápidas (registrar liquidação).
- Modal de liquidação: valor, data, método, upload de comprovante.

Viagens:
- Kanban (abertas/em_andamento/encerradas) e lista com KPIs por viagem.
- Detalhe: custos, receita, custo/km, anexos e timeline.

Inteligência (IA):
- Resumo de insights (prioridade/impacto), ações sugeridas e feedback (útil/não).
- OCR em lote: fila, progresso, confiabilidade por campo.

Relatórios:
- Filtros avançados; exportar CSV/XLSX/PDF; snapshots mensais.

Configurações:
- Usuários e papéis (RBAC), categorias, centros de custo, preferências de layout (densidade, modo).

====================================================================
16) ESTILO DE CÓDIGO E NOMENCLATURA
====================================================================
- Componentes React com nomes PascalCase (ex.: DataTable, KpiCard, Sidebar).
- Pasta ui/ para moléculas e átomos: Button, Input, Card, Badge, Modal, Tabs, Tooltip.
- hooks/ para lógica de UI (useMediaQuery, useTheme, useToast).
- lib/ para formatação (formatMoney, formatDate, cn/classnames).
- Sempre preferir composição a props booleanas múltiplas.

====================================================================
17) PERFORMANCE E RESPONSIVIDADE
====================================================================
- Evitar colunas > 8 em mobile; collapse de filtros em Accordion.
- Virtualização de listas longas (react-virtual) quando > 100 linhas.
- Lazy load de gráficos e rotas secundárias; suspense boundaries.
- Medir CLS/LCP; fontes do sistema por padrão (sem webfonts pesadas).

====================================================================
18) TESTABILIDADE E ESTADOS MOCK
====================================================================
- Storybook opcional para variações de componentes (temas e densidades).
- Fixtures para estados: loading, empty, error, success; dark/light.
- Testes de snapshot e de acessibilidade (axe) em componentes críticos.

====================================================================
19) BRANDING E PERSONALIZAÇÃO FUTURA
====================================================================
- Todas as cores referenciam tokens; nunca hardcode hexadecimal em componentes.
- Logo em SVG monocromático por padrão; versão compacta para favicon.
- Espaço para “marca fantasia” (nome dos sócios) no canto da sidebar e na tela de login.

====================================================================
20) IMPRESSÃO E EXPORTAÇÃO
====================================================================
- Estilos @media print para relatórios: fundo branco, texto escuro, esconder navegação, incluir cabeçalho com logo/data.
- PDFs gerados devem herdar tipografia base e margens de 24–32px.

====================================================================
21) I18N E FORMATAÇÃO
====================================================================
- Datas no padrão local (pt-BR), moeda BRL (R$ 12.345,67).
- Textos de UI separados em dicionários; labels consistentes.

====================================================================
22) CHECKLIST DE ACEITE DO TEMA
====================================================================
[ ] Tokens implementados (cores, radius, sombras, tipografia).
[ ] Suporte dark-first e alternância light (opcional) sem regressões.
[ ] Componentes base (Button, Input, Select, Badge, Card, Modal, Tabs, Tooltip, DataTable, Dropzone).
[ ] Layouts prontos: Dashboard, Listagem, Detalhe, Formulário, IA, Relatórios, Configurações.
[ ] Acessibilidade AA validada (contraste, foco, aria).
[ ] Responsividade comprovada (sm–2xl), tabelas com fallback em cards.
[ ] Estados (loading/empty/error/success) em todos os módulos principais.
[ ] Desempenho aceitável (lazy, virtualização quando necessário).
[ ] Documentação rápida de uso dos componentes e exemplos de composição.

FIM DO DOCUMENTO.
