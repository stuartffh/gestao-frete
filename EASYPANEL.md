# =€ Deploy no Easypanel

Guia completo para fazer deploy do Sistema de Gestão de Fretes no Easypanel.

---

## =Ë Pré-requisitos

1. Conta no Easypanel com servidor configurado
2. Repositório Git conectado (GitHub/GitLab)
3. 2 subdomínios configurados:
   - `api.seudominio.com` ’ Backend
   - `app.seudominio.com` ’ Frontend

---

## = Passo 1: Gerar Secrets Fortes

Antes de começar, gere secrets criptográficos fortes:

```bash
# Execute 2 vezes para gerar JWT_SECRET e JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Anote os valores gerados, você vai precisar deles.

---

## =Ä Passo 2: Criar Serviço PostgreSQL

1. No Easypanel, clique em **"Create Service"**
2. Selecione **"Database" ’ "PostgreSQL"**
3. Configure:
   - **Service Name:** `gestao-frete-db`
   - **Version:** `16-alpine`
   - **Database Name:** `gestao_frete`
   - **Username:** `postgres`
   - **Password:** `<senha_forte_aqui>`

4. **Storage (Volume):**
   - Path: `/var/lib/postgresql/data`
   - Size: `10GB` (mínimo)

5. **Environment Variables:**
   ```
   POSTGRES_SHARED_BUFFERS=256MB
   POSTGRES_MAX_CONNECTIONS=100
   ```

6. Clique em **"Deploy"**

---

## =' Passo 3: Criar Serviço Backend (API)

1. Clique em **"Create Service"** ’ **"App"**
2. Configure:
   - **Service Name:** `gestao-frete-backend`
   - **Source:** Conecte seu repositório Git
   - **Branch:** `master` ou `main`

3. **Build Settings:**
   - **Build Type:** `Dockerfile`
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Build Context:** `backend`

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=gestao-frete-db
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=<mesma_senha_do_passo_2>
   DB_NAME=gestao_frete
   JWT_SECRET=<secret_gerado_no_passo_1>
   JWT_REFRESH_SECRET=<outro_secret_gerado_no_passo_1>
   LOG_LEVEL=info
   ```

5. **Networking:**
   - **Port:** `3001`
   - **Domain:** `api.seudominio.com`
   - **Enable HTTPS:**  Sim

6. **Storage (Volumes):**
   Crie 3 volumes persistentes:
   - `/app/uploads` ’ 20GB
   - `/app/backups` ’ 10GB
   - `/app/logs` ’ 2GB

7. **Health Check:**
   - **Path:** `/health`
   - **Port:** `3001`
   - **Interval:** `30s`

8. **Resource Limits:**
   - **CPU:** `1 core`
   - **Memory:** `1GB`

9. Clique em **"Deploy"**

---

## <¨ Passo 4: Criar Serviço Frontend

1. Clique em **"Create Service"** ’ **"App"**
2. Configure:
   - **Service Name:** `gestao-frete-frontend`
   - **Source:** Mesmo repositório Git
   - **Branch:** `master` ou `main`

3. **Build Settings:**
   - **Build Type:** `Dockerfile`
   - **Dockerfile Path:** `frontend/Dockerfile`
   - **Build Context:** `frontend`

4. **  Build Arguments (IMPORTANTE!):**
   ```
   VITE_API_URL=https://api.seudominio.com
   ```

   **Onde configurar:**
   - No Easypanel, procure por "Build Arguments" ou "Build-time Environment Variables"
   - Adicione: `VITE_API_URL` com o valor `https://api.seudominio.com`
   - **CRÍTICO:** Este valor é injetado durante o build e define onde o frontend vai buscar a API

5. **Networking:**
   - **Port:** `80`
   - **Domain:** `app.seudominio.com`
   - **Enable HTTPS:**  Sim

6. **Health Check:**
   - **Path:** `/health`
   - **Port:** `80`
   - **Interval:** `30s`

7. **Resource Limits:**
   - **CPU:** `0.5 core`
   - **Memory:** `256MB`

8. Clique em **"Deploy"**

---

## = Ordem de Inicialização

O Easypanel deve iniciar os serviços nesta ordem:

1. **PostgreSQL** (precisa estar 100% pronto)
2. **Backend** (aguarda PostgreSQL estar healthy)
3. **Frontend** (aguarda Backend estar healthy)

Configure **dependencies** no Easypanel se necessário.

---

## >ê Passo 5: Testar Deploy

### 5.1 Testar Backend
```bash
curl https://api.seudominio.com/health
# Resposta esperada: {"status":"ok"}
```

### 5.2 Testar Frontend
Abra no navegador: `https://app.seudominio.com`

Você deve ver a tela de login do sistema.

### 5.3 Testar Conexão API
No navegador, abra DevTools (F12) e veja a aba **Network**.
Ao tentar fazer login, você deve ver requisições para:
```
https://api.seudominio.com/api/auth/login
```

---

## =á Passo 6: Segurança

### 6.1 CORS no Backend

Verifique se o backend aceita requisições do seu domínio frontend:

**backend/src/server.js:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://app.seudominio.com'],
  credentials: true
}));
```

### 6.2 Environment Variables Sensíveis

 **Nunca commite valores reais no Git**
- Use `.env.example` como template
- Configure valores reais apenas no Easypanel

### 6.3 HTTPS Obrigatório

 Certifique-se que ambos os domínios usam HTTPS:
- `https://api.seudominio.com`
- `https://app.seudominio.com`

---

## =' Troubleshooting

### L Frontend não conecta na API

**Problema:** Erro de CORS ou API não encontrada

**Solução:**
1. Verifique se `VITE_API_URL` foi configurado como **Build Argument** (não como ENV comum)
2. Rebuild o frontend com o Build Argument correto
3. Limpe o cache do browser (Ctrl+Shift+R)

**Como verificar:**
```javascript
// No console do browser (F12):
console.log(import.meta.env.VITE_API_URL)
// Deve retornar: https://api.seudominio.com
```

### L Backend não conecta no PostgreSQL

**Problema:** `ECONNREFUSED` ou timeout

**Solução:**
1. Verifique se o `DB_HOST` está correto (nome do serviço PostgreSQL)
2. Certifique-se que os serviços estão na mesma **network** no Easypanel
3. Verifique logs do PostgreSQL

### L Erro 502 Bad Gateway

**Problema:** Nginx não consegue conectar no backend

**Solução:**
1. Verifique se o backend está rodando (health check)
2. Confirme que a porta `3001` está exposta
3. Verifique logs do backend

---

## =Ê Monitoramento

### Logs no Easypanel

Acesse os logs de cada serviço:
- **PostgreSQL:** Logs de queries e conexões
- **Backend:** Logs de requisições (Winston)
- **Frontend:** Logs do Nginx (access/error)

### Health Checks

O Easypanel monitora automaticamente:
- **Backend:** `GET /health` (deve retornar 200)
- **Frontend:** `GET /health` (deve retornar 200)
- **PostgreSQL:** `pg_isready`

---

## =€ Deploy de Atualizações

### Opção 1: Auto-deploy (Recomendado)

Configure webhook no GitHub/GitLab para rebuild automático quando fizer push para `master`.

### Opção 2: Deploy Manual

No Easypanel, clique em **"Rebuild"** no serviço que deseja atualizar.

**  IMPORTANTE para Frontend:**
Sempre que rebuild o frontend, certifique-se que o **Build Argument** `VITE_API_URL` ainda está configurado!

---

## =æ Backup

### Backup do PostgreSQL

Configure backup automático no Easypanel ou via cron:

```bash
# No serviço PostgreSQL, crie um cron job:
0 2 * * * pg_dump -U postgres gestao_frete > /backups/db_$(date +\%Y\%m\%d).sql
```

### Backup de Uploads

Configure backup do volume `/app/uploads` para S3 ou similar.

---

## <¯ Checklist Final

Antes de marcar como "pronto para produção":

- [ ] PostgreSQL com senha forte
- [ ] JWT_SECRET e JWT_REFRESH_SECRET únicos e seguros
- [ ] HTTPS habilitado em ambos os domínios
- [ ] CORS configurado corretamente no backend
- [ ] `VITE_API_URL` configurado como Build Argument no frontend
- [ ] Health checks funcionando (Backend + Frontend)
- [ ] Volumes persistentes configurados (uploads, backups, logs)
- [ ] Backup automático do banco de dados
- [ ] Logs sendo monitorados
- [ ] Resource limits configurados

---

## =Þ Suporte

Se encontrar problemas:

1. Verifique os logs no Easypanel
2. Teste os health checks manualmente
3. Confirme que as variáveis de ambiente estão corretas
4. Verifique se os serviços estão na mesma network

---

** Deploy concluído com sucesso!**

Acesse: `https://app.seudominio.com` =€
