# =Ä Database - Sistema de Gestão de Fretes

Documentação completa do banco de dados do sistema.

---

## =Ê Estrutura do Banco

O sistema utiliza **PostgreSQL 16** com as seguintes tabelas:

### **RBAC (Controle de Acesso)**
- `roles` - Funções/cargos (Admin, Gerente, Operador, Financeiro)
- `users` - Usuários do sistema
- `refresh_tokens` - Tokens de renovação JWT

### **Auditoria**
- `audit_logs` - Log de todas as ações do sistema

### **Cadastros Base**
- `motoristas` - Motoristas cadastrados
- `veiculos` - Veículos cadastrados
- `clientes` - Clientes (PF e PJ)

### **Gestão de Viagens**
- `viagens` - Ordens de serviço e viagens
- `notas_fiscais` - Notas fiscais vinculadas

### **Financeiro**
- `contas_pagar` - Contas a pagar
- `contas_receber` - Contas a receber
- `parcelas` - Parcelas de contas
- `recorrencias` - Contas recorrentes
- `caixa` - Movimentações de caixa

### **Alertas**
- `alertas` - Alertas e notificações do sistema

---

## =€ Inicialização Automática

O banco é inicializado **automaticamente** na primeira vez que o servidor sobe.

```bash
cd backend
npm start
```

O sistema verifica se a tabela `users` existe. Se não existir, executa `init.sql` automaticamente.

---

##  Comandos Manuais

### **Criar estrutura do banco (primeira vez)**
```bash
npm run db:migrate
```

### **Resetar banco (APAGA TODOS OS DADOS!)**
```bash
npm run db:reset
```

**  CUIDADO:** O comando `db:reset` apaga TODOS os dados do banco!

---

## =d Usuário Padrão

Após a inicialização, o sistema cria automaticamente:

```
Username: admin
Email: admin@gestao-frete.com
Senha: admin123
Role: Admin (acesso total)
```

**= IMPORTANTE:** Altere a senha padrão imediatamente em produção!

---

## =' Configuração

As credenciais do banco são configuradas via variáveis de ambiente:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=gestao_frete
```

---

## =Á Arquivos

- `init.sql` - Script SQL completo de inicialização (DDL + seed data)
- `migrate.js` - Executa migração manual
- `reset.js` - Reseta o banco (drop + create)
- `checkAndMigrate.js` - Verifica e migra automaticamente no startup

---

## = Views Disponíveis

O sistema cria views para facilitar consultas:

### `vw_viagens_completas`
Viagens com todos os dados relacionados (cliente, motorista, veículo, etc)

### `vw_contas_pagar_pendentes`
Contas a pagar com situação calculada (atrasado, vence_hoje, pendente)

### `vw_contas_receber_pendentes`
Contas a receber com situação calculada

---

## <¯ Índices de Performance

O script cria índices automáticos em:
- Chaves primárias e estrangeiras
- Campos de busca (CPF, CNPJ, placa, etc)
- Campos de filtro (status, data_vencimento, etc)
- Campos de ordenação (created_at, updated_at)

---

## = Triggers

### `update_updated_at_column()`
Atualiza automaticamente o campo `updated_at` em todas as tabelas quando há UPDATE.

---

## =á Segurança

1. **Senhas criptografadas**: bcrypt com salt rounds = 10
2. **Soft delete**: Tabelas usam `deleted_at` em vez de DELETE físico
3. **Auditoria**: Todas as ações são registradas em `audit_logs`
4. **RBAC**: Controle granular de permissões por role

---

## =Ý Exemplo de Uso

### Criar banco manualmente (desenvolvimento local)

```bash
# 1. Criar banco no PostgreSQL
createdb gestao_frete

# 2. Executar migração
cd backend
npm run db:migrate
```

### Docker/Easypanel (automático)

No Docker/Easypanel, o banco é criado automaticamente na primeira inicialização:

```yaml
# docker-compose.yml ou Easypanel
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: gestao_frete
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: sua_senha

  backend:
    depends_on:
      - db
    # Ao iniciar, o backend executa checkAndMigrate() automaticamente
```

---

## = Troubleshooting

### Erro: "relation 'users' does not exist"

**Causa:** Banco não foi inicializado

**Solução:**
```bash
npm run db:migrate
```

### Erro: "duplicate key value violates unique constraint"

**Causa:** Tentando criar dados que já existem (ex: usuário admin)

**Solução:** Os comandos usam `ON CONFLICT DO NOTHING` para evitar isso. Se persistir, use:
```bash
npm run db:reset  # CUIDADO: Apaga todos os dados!
```

### Erro: "ECONNREFUSED" ou "connection refused"

**Causa:** PostgreSQL não está rodando ou credenciais incorretas

**Solução:**
1. Verifique se o PostgreSQL está rodando
2. Confirme as variáveis de ambiente (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD)
3. Teste a conexão: `psql -h localhost -U postgres -d gestao_frete`

---

## =Ú Referências

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg library](https://node-postgres.com/)
- Schema detalhado: Ver `init.sql`

---

** Banco configurado e pronto para uso!**
