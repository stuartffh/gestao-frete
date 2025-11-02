# Sistema de Gestão de Frete e Notas Fiscais

Sistema completo para gestão de notas fiscais de frete e módulo financeiro completo, com autenticação JWT+RBAC, auditoria, cadastros base, viagens, alertas e muito mais.

## 🚀 Tecnologias

- **Frontend**: React + Vite + Tailwind CSS (tema escuro)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Containerização**: Docker + Docker Compose

## 📋 Funcionalidades

### Módulo de Notas Fiscais
- ✅ Cadastro e gestão de notas fiscais
- ✅ Upload de PDFs e fotos das notas
- ✅ Relatórios analíticos (semanal, mensal, anual)
- ✅ Exportação de relatórios em CSV
- ✅ Dashboard com gráficos de desempenho

### Módulo Financeiro Completo
- ✅ **Contas a Pagar**: CRUD completo, marcar como pago, upload de comprovantes
- ✅ **Contas a Receber**: CRUD completo, marcar como recebido, upload de comprovantes
- ✅ **Pagamentos**: Gestão completa de pagamentos e recebimentos
- ✅ **Relatórios Financeiro**: Fluxo de caixa, por categoria, filtros por período
- ✅ **Exportação**: CSV, XLSX e PDF
- ✅ **Segurança**: Autenticação JWT + RBAC (Role-Based Access Control)
- ✅ **Upload de Comprovantes**: Imagens (JPEG, PNG, WebP) e PDFs

### Interface
- ✅ Interface moderna com tema escuro profissional
- ✅ Layout responsivo e dashboard moderno
- ✅ Compatível com EasyPanel

## 🛠️ Instalação e Execução

### Pré-requisitos

- Docker e Docker Compose instalados

### Execução com Docker Compose

1. Clone o repositório:
```bash
git clone <repository-url>
cd contas
```

2. Crie o arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Acesse a aplicação:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `admin123`

### Execução em Desenvolvimento

1. Instale as dependências:
```bash
npm run install:all
```

2. Inicie o backend:
```bash
cd backend && npm run dev
```

3. Em outro terminal, inicie o frontend:
```bash
cd frontend && npm run dev
```

## 📁 Estrutura do Projeto

```
contas/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── routes/
│   │   │   ├── notas.js
│   │   │   ├── relatorios.js
│   │   │   └── upload.js
│   │   └── server.js
│   ├── uploads/
│   │   ├── pdfs/
│   │   └── fotos/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🗄️ Schema do Banco de Dados

O sistema cria automaticamente a tabela `notas_fiscais` com os seguintes campos:

- `id`: Identificador único
- `numero`: Número da nota fiscal
- `serie`: Série da nota
- `emitente`: Nome do emitente
- `destinatario`: Nome do destinatário
- `valor`: Valor da nota
- `data_emissao`: Data de emissão
- `data_vencimento`: Data de vencimento
- `data_pagamento`: Data de pagamento
- `status`: Status (pendente, paga, vencida)
- `tipo_frete`: Tipo de frete
- `veiculo`: Veículo utilizado
- `motorista`: Nome do motorista
- `observacoes`: Observações adicionais
- `pdf_path`: Caminho do arquivo PDF
- `foto_path`: Caminho da foto

## 📊 Relatórios Disponíveis

- **Relatório por Período**: Análise temporal dos dados
- **Relatório por Status**: Distribuição por status de pagamento
- **Relatório por Emitente**: Top emitentes por valor
- **Relatório de Desempenho**: Métricas gerais do sistema
- **Exportação CSV**: Download de relatórios completos

## 🔧 Configuração para EasyPanel

Para usar com EasyPanel, certifique-se de que:

1. O `docker-compose.yml` está no diretório do projeto
2. As portas estão configuradas corretamente (3000 para frontend, 3001 para backend, 5432 para PostgreSQL)
3. Os volumes estão configurados para persistência de dados (`postgres_data` e `backend/uploads`)
4. O arquivo `.env` está configurado com as credenciais apropriadas

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DB_USER=postgres
DB_PASSWORD=seu_password_seguro
DB_NAME=gestao_frete
DB_HOST=db
DB_PORT=5432

# Backend
PORT=3001
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_super_segura_aqui
LOG_LEVEL=info

# Frontend
VITE_API_URL=http://localhost:3001
```

**Nota**: Para produção, altere as chaves secretas e URLs apropriadamente.

## 🔐 Autenticação e Segurança

### Papéis Disponíveis
- **admin**: Acesso total ao sistema
- **financeiro**: Acesso a módulos financeiros
- **operador**: Acesso a viagens e notas
- **leitor**: Acesso apenas de leitura

### Credenciais Padrão
- Usuário: `admin`
- Senha: `admin123`

**⚠️ IMPORTANTE**: Altere a senha padrão em produção!

## 📚 Funcionalidades Implementadas

### ✅ RBAC + Auditoria
- JWT com access token (15min) e refresh token (7 dias)
- 4 níveis de papéis (admin, financeiro, operador, leitor)
- Sistema completo de auditoria (audit_log)
- Middleware de autorização por rota

### ✅ Cadastros Base
- CRUD completo de Clientes, Fornecedores, Veículos e Motoristas
- Soft-delete em todos os cadastros
- Validação, paginação e busca

### ✅ Viagens/OS
- Cadastro de viagens (origem, destino, cliente, veículo, motorista)
- Controle de km previsto/real
- Despesas de viagem
- Checklist de viagem
- Relatórios com custo/km

### ✅ Alertas & Notificações
- Alertas automáticos de vencimento (diário às 8h)
- Alertas de vencidos e "vencendo em X dias"
- Sistema de notificações por usuário

### ✅ Backups & Healthchecks
- Backup automático diário do PostgreSQL (2h da manhã)
- Endpoints `/health` e `/ready`
- Logs estruturados em JSON (Winston)

## 📋 Funcionalidades em Desenvolvimento

Ver `CHECKLIST_STATUS.md` para status completo das funcionalidades.

## 📝 Licença

Este projeto está sob a licença ISC.

