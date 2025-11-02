# 🚀 Guia de Deploy em Produção

Instruções completas para fazer deploy da aplicação em ambiente de produção.

---

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Servidor Linux (Ubuntu 20.04+ recomendado)
- Mínimo 2GB RAM, 2 CPU cores
- 20GB de espaço em disco

---

## 🔐 1. Preparação de Segurança

### Gerar Secrets Fortes

```bash
# Gerar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Gerar JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Gerar senha do banco de dados
openssl rand -base64 32
```

### Criar arquivo .env

```bash
cp .env.example .env
nano .env
```

**Edite o arquivo .env com os valores gerados:**

```env
# Database
DB_USER=postgres
DB_PASSWORD=<SENHA_FORTE_AQUI>
DB_NAME=gestao_frete

# JWT Secrets
JWT_SECRET=<SECRET_64_BYTES_AQUI>
JWT_REFRESH_SECRET=<OUTRO_SECRET_64_BYTES_AQUI>

# Logging
LOG_LEVEL=warn
```

**IMPORTANTE:**
- ✅ Use senhas fortes e únicas
- ✅ Nunca commite o arquivo .env no git
- ✅ Mantenha backup seguro das credenciais

---

## 🏗️ 2. Build e Deploy

### Opção A: Deploy Simples (Servidor Único)

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd contas

# 2. Configure variáveis de ambiente
cp .env.example .env
nano .env  # Edite com valores reais

# 3. Build e start
docker-compose up -d --build

# 4. Verificar logs
docker-compose logs -f

# 5. Verificar health
curl http://localhost:3000/health
curl http://localhost:3001/health
```

### Opção B: Deploy com CI/CD (GitHub Actions)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/gestao-frete
            git pull origin main
            docker-compose down
            docker-compose up -d --build
```

---

## 🔧 3. Configuração de Firewall

```bash
# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir SSH
sudo ufw allow 22/tcp

# Bloquear portas internas (não expor diretamente)
# Porta 3001 (backend) e 5432 (postgres) só acessíveis via localhost
```

---

## 🌐 4. Configurar Nginx como Reverse Proxy (Opcional mas Recomendado)

Se quiser usar SSL/HTTPS, configure nginx no host:

```bash
sudo apt install nginx certbot python3-certbot-nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/gestao-frete
```

**Conteúdo:**

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/gestao-frete /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Configurar SSL (Let's Encrypt)
sudo certbot --nginx -d seu-dominio.com
```

---

## 📊 5. Monitoramento

### Verificar Status dos Containers

```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### Health Checks

```bash
# Frontend
curl http://localhost:3000/health

# Backend
curl http://localhost:3001/health
curl http://localhost:3001/ready
```

### Métricas de Recursos

```bash
# Ver uso de CPU/Memória
docker stats

# Ver logs em tempo real
docker-compose logs -f --tail=100
```

---

## 🗄️ 6. Backup e Restore

### Backup Automático

O backend já possui rotina de backup diário configurada via cron.

Backups ficam salvos em: `./backend/backups/`

### Backup Manual

```bash
# Backup do banco de dados
docker-compose exec db pg_dump -U postgres gestao_frete > backup_$(date +%Y%m%d).sql

# Backup de uploads
tar -czf uploads_$(date +%Y%m%d).tar.gz backend/uploads/
```

### Restore

```bash
# Restaurar banco de dados
cat backup_20231201.sql | docker-compose exec -T db psql -U postgres gestao_frete

# Restaurar uploads
tar -xzf uploads_20231201.tar.gz
```

---

## 🔄 7. Atualizações

```bash
# 1. Pull das mudanças
git pull origin main

# 2. Rebuild apenas o que mudou
docker-compose up -d --build

# 3. Verificar logs
docker-compose logs -f --tail=50
```

### Zero Downtime Update (Blue-Green)

Para atualizações sem downtime, use:

```bash
# 1. Buildar nova versão
docker-compose build

# 2. Escalar backend (mantém antigo rodando)
docker-compose up -d --no-deps --scale backend=2 backend

# 3. Parar container antigo
docker stop gestao_frete_backend

# 4. Atualizar frontend
docker-compose up -d --no-deps frontend
```

---

## 🚨 8. Troubleshooting

### Containers não iniciam

```bash
# Ver logs detalhados
docker-compose logs backend
docker-compose logs frontend

# Verificar configuração
docker-compose config

# Rebuild completo
docker-compose down
docker-compose up -d --build --force-recreate
```

### Banco de dados não conecta

```bash
# Verificar se está rodando
docker-compose ps db

# Ver logs do postgres
docker-compose logs db

# Testar conexão
docker-compose exec db psql -U postgres -c "SELECT 1"
```

### Frontend retorna 502 Bad Gateway

```bash
# Verificar se backend está UP
curl http://localhost:3001/health

# Ver logs do nginx
docker-compose logs frontend

# Reiniciar frontend
docker-compose restart frontend
```

### Alto uso de memória

```bash
# Ver uso atual
docker stats

# Reduzir limites no docker-compose.yml se necessário
# Edite as seções deploy > resources > limits
```

---

## 🔐 9. Checklist de Segurança Pré-Deploy

- [ ] Secrets gerados com crypto forte (64+ bytes)
- [ ] Arquivo .env não está no git (.gitignore)
- [ ] Senha do banco de dados é forte (20+ caracteres)
- [ ] Firewall configurado (apenas portas 80/443 expostas)
- [ ] SSL/HTTPS configurado (Let's Encrypt ou certificado próprio)
- [ ] Backup automático funcionando
- [ ] Health checks respondendo
- [ ] Resource limits configurados
- [ ] Containers rodando como non-root
- [ ] Logs sendo salvos e rotacionados

---

## 📈 10. Performance em Produção

### Otimizações Aplicadas

✅ **Frontend:**
- Gzip compression habilitada
- Cache de assets estáticos (1 ano)
- Build otimizado (minificado e tree-shaken)
- Lazy loading de rotas
- Virtualização de tabelas longas

✅ **Backend:**
- Multi-stage build (imagem pequena)
- Apenas dependências de produção
- Connection pooling do PostgreSQL
- Compressão de responses

✅ **Banco de Dados:**
- Índices em todas as queries frequentes
- Shared buffers otimizado (256MB)
- Max connections limitado (100)

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker-compose logs`
2. Consulte a documentação do projeto
3. Abra uma issue no GitHub

---

**Última atualização:** 2025-11-02
**Versão:** 1.0.0
**Compatibilidade:** Docker 20.10+, Docker Compose 2.0+
