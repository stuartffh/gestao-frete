import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import winston from 'winston';
import { pool } from './config/database.js';
import logger from './config/logger.js';
import './scripts/cron.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import notasRoutes from './routes/notas.js';
import relatoriosRoutes from './routes/relatorios.js';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';
import contasPagarRoutes from './routes/contas-pagar.js';
import contasReceberRoutes from './routes/contas-receber.js';
import pagamentosRoutes from './routes/pagamentos.js';
import comprovantesRoutes from './routes/comprovantes.js';
import relatoriosFinanceiroRoutes from './routes/relatorios-financeiro.js';
import cadastrosBaseRoutes from './routes/cadastros-base.js';
import viagensRoutes from './routes/viagens.js';
import alertasRoutes from './routes/alertas.js';
import auditRoutes from './routes/audit.js';
import parcelasRoutes from './routes/parcelas.js';
import recorrenciasRoutes from './routes/recorrencias.js';
import caixaRoutes from './routes/caixa.js';
import importacaoRoutes from './routes/importacao.js';
import conciliacaoRoutes from './routes/conciliacao.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas (financeiro)
app.use('/api/contas-pagar', contasPagarRoutes);
app.use('/api/contas-receber', contasReceberRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/comprovantes', comprovantesRoutes);
app.use('/api/relatorios-financeiro', relatoriosFinanceiroRoutes);

// Rotas de cadastros base
app.use('/api/cadastros', cadastrosBaseRoutes);

// Rotas de viagens
app.use('/api/viagens', viagensRoutes);

// Rotas de alertas
app.use('/api/alertas', alertasRoutes);

// Rotas de auditoria (apenas admin)
app.use('/api/audit', auditRoutes);

// Rotas de parcelas e recorrências
app.use('/api/parcelas', parcelasRoutes);
app.use('/api/recorrencias', recorrenciasRoutes);

// Rotas de caixa
app.use('/api/caixa', caixaRoutes);

// Rotas de importação e conciliação
app.use('/api/importacao', importacaoRoutes);
app.use('/api/conciliacao', conciliacaoRoutes);

// Rotas (notas fiscais - manter sem auth por enquanto)
app.use('/api/notas', notasRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness check
app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// Inicializar banco de dados
async function initDatabase() {
  try {
    await pool.query(`
      -- Tabela de roles
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        permissions JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id INTEGER REFERENCES roles(id) DEFAULT 2,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de notas fiscais (existente)
      CREATE TABLE IF NOT EXISTS notas_fiscais (
        id SERIAL PRIMARY KEY,
        numero VARCHAR(100) NOT NULL,
        serie VARCHAR(20),
        emitente VARCHAR(255) NOT NULL,
        destinatario VARCHAR(255),
        valor DECIMAL(12, 2) NOT NULL,
        data_emissao DATE NOT NULL,
        data_vencimento DATE,
        data_pagamento DATE,
        status VARCHAR(50) DEFAULT 'pendente',
        tipo_frete VARCHAR(50),
        veiculo VARCHAR(100),
        motorista VARCHAR(255),
        viagem_id INTEGER REFERENCES viagens(id),
        observacoes TEXT,
        pdf_path VARCHAR(500),
        foto_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de contas a pagar
      CREATE TABLE IF NOT EXISTS contas_pagar (
        id SERIAL PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(12, 2) NOT NULL,
        data_vencimento DATE NOT NULL,
        data_pagamento DATE,
        categoria VARCHAR(100),
        fornecedor VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pendente',
        observacoes TEXT,
        comprovante_path VARCHAR(500),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de contas a receber
      CREATE TABLE IF NOT EXISTS contas_receber (
        id SERIAL PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(12, 2) NOT NULL,
        data_vencimento DATE NOT NULL,
        data_recebimento DATE,
        categoria VARCHAR(100),
        cliente VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pendente',
        observacoes TEXT,
        comprovante_path VARCHAR(500),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de pagamentos
      CREATE TABLE IF NOT EXISTS pagamentos (
        id SERIAL PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(12, 2) NOT NULL,
        data_pagamento DATE NOT NULL,
        tipo VARCHAR(50) NOT NULL, -- 'pagar' ou 'receber'
        categoria VARCHAR(100),
        beneficiario VARCHAR(255),
        forma_pagamento VARCHAR(100),
        observacoes TEXT,
        comprovante_path VARCHAR(500),
        conta_id INTEGER,
        conta_tipo VARCHAR(50), -- 'pagar' ou 'receber'
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices
      CREATE INDEX IF NOT EXISTS idx_notas_data_emissao ON notas_fiscais(data_emissao);
      CREATE INDEX IF NOT EXISTS idx_notas_status ON notas_fiscais(status);
      CREATE INDEX IF NOT EXISTS idx_notas_data_pagamento ON notas_fiscais(data_pagamento);
      
      CREATE INDEX IF NOT EXISTS idx_contas_pagar_data_vencimento ON contas_pagar(data_vencimento);
      CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
      CREATE INDEX IF NOT EXISTS idx_contas_receber_data_vencimento ON contas_receber(data_vencimento);
      CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
      CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data_pagamento);
      CREATE INDEX IF NOT EXISTS idx_pagamentos_tipo ON pagamentos(tipo);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      -- Tabela de refresh tokens
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de auditoria
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id INTEGER,
        before_data JSONB,
        after_data JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

      -- Tabelas de cadastros base
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf_cnpj VARCHAR(20),
        email VARCHAR(255),
        telefone VARCHAR(20),
        endereco TEXT,
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(10),
        observacoes TEXT,
        user_id INTEGER REFERENCES users(id),
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fornecedores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf_cnpj VARCHAR(20),
        email VARCHAR(255),
        telefone VARCHAR(20),
        endereco TEXT,
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(10),
        observacoes TEXT,
        user_id INTEGER REFERENCES users(id),
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS veiculos (
        id SERIAL PRIMARY KEY,
        placa VARCHAR(10) UNIQUE NOT NULL,
        marca VARCHAR(100),
        modelo VARCHAR(100),
        ano INTEGER,
        tipo VARCHAR(50),
        capacidade DECIMAL(10, 2),
        km_atual DECIMAL(12, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'ativo',
        observacoes TEXT,
        user_id INTEGER REFERENCES users(id),
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS motoristas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) UNIQUE,
        cnh VARCHAR(20),
        categoria_cnh VARCHAR(2),
        telefone VARCHAR(20),
        email VARCHAR(255),
        endereco TEXT,
        status VARCHAR(50) DEFAULT 'ativo',
        observacoes TEXT,
        user_id INTEGER REFERENCES users(id),
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_clientes_deleted ON clientes(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_fornecedores_deleted ON fornecedores(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_veiculos_deleted ON veiculos(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_motoristas_deleted ON motoristas(deleted_at);

      -- Tabela de viagens
      CREATE TABLE IF NOT EXISTS viagens (
        id SERIAL PRIMARY KEY,
        origem VARCHAR(255) NOT NULL,
        destino VARCHAR(255) NOT NULL,
        cliente_id INTEGER REFERENCES clientes(id),
        veiculo_id INTEGER REFERENCES veiculos(id),
        motorista_id INTEGER REFERENCES motoristas(id),
        km_previsto DECIMAL(10, 2),
        km_real DECIMAL(10, 2),
        data_saida DATE,
        data_chegada DATE,
        status VARCHAR(50) DEFAULT 'aberta',
        custo_total DECIMAL(12, 2) DEFAULT 0,
        custo_por_km DECIMAL(12, 2) DEFAULT 0,
        observacoes TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS viagem_despesas (
        id SERIAL PRIMARY KEY,
        viagem_id INTEGER REFERENCES viagens(id) ON DELETE CASCADE,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(12, 2) NOT NULL,
        categoria VARCHAR(100),
        data DATE DEFAULT CURRENT_DATE,
        comprovante_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS viagem_checklist (
        id SERIAL PRIMARY KEY,
        viagem_id INTEGER REFERENCES viagens(id) ON DELETE CASCADE,
        item VARCHAR(255) NOT NULL,
        concluido BOOLEAN DEFAULT false,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabelas de parcelas e recorrências
      CREATE TABLE IF NOT EXISTS parcelas (
        id SERIAL PRIMARY KEY,
        conta_id INTEGER NOT NULL,
        conta_tipo VARCHAR(50) NOT NULL,
        numero_parcela INTEGER NOT NULL,
        total_parcelas INTEGER NOT NULL,
        valor DECIMAL(12, 2) NOT NULL,
        data_vencimento DATE NOT NULL,
        data_pagamento DATE,
        status VARCHAR(50) DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lancamentos_recorrentes (
        id SERIAL PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(12, 2) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        frequencia VARCHAR(50) NOT NULL,
        dia_vencimento INTEGER,
        data_inicio DATE NOT NULL,
        data_fim DATE,
        ativo BOOLEAN DEFAULT true,
        categoria VARCHAR(100),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabelas de caixa
      CREATE TABLE IF NOT EXISTS caixa_diario (
        id SERIAL PRIMARY KEY,
        data DATE UNIQUE NOT NULL,
        saldo_inicial DECIMAL(12, 2) DEFAULT 0,
        saldo_final DECIMAL(12, 2),
        status VARCHAR(50) DEFAULT 'aberto',
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fechamento_mensal (
        id SERIAL PRIMARY KEY,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        saldo_inicial DECIMAL(12, 2) NOT NULL,
        total_receitas DECIMAL(12, 2) DEFAULT 0,
        total_despesas DECIMAL(12, 2) DEFAULT 0,
        saldo_final DECIMAL(12, 2) NOT NULL,
        snapshot JSONB,
        fechado_em TIMESTAMP,
        fechado_por INTEGER REFERENCES users(id),
        trava_edicao BOOLEAN DEFAULT false,
        UNIQUE(mes, ano)
      );

      -- Tabela de alertas
      CREATE TABLE IF NOT EXISTS alertas (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        tipo VARCHAR(50) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        mensagem TEXT,
        lido BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_viagens_cliente ON viagens(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_viagens_status ON viagens(status);
      CREATE INDEX IF NOT EXISTS idx_parcelas_conta ON parcelas(conta_id, conta_tipo);
      CREATE INDEX IF NOT EXISTS idx_alertas_user ON alertas(user_id, lido);
    `);

    // Criar roles padrão
    await pool.query(`
      INSERT INTO roles (id, name, description, permissions) VALUES
      (1, 'admin', 'Administrador', '["*"]')
      ON CONFLICT (id) DO NOTHING;
      
      INSERT INTO roles (id, name, description, permissions) VALUES
      (2, 'financeiro', 'Financeiro', '["contas_pagar:*", "contas_receber:*", "pagamentos:*", "relatorios:*", "caixa:*"]')
      ON CONFLICT (id) DO NOTHING;
      
      INSERT INTO roles (id, name, description, permissions) VALUES
      (3, 'operador', 'Operador', '["viagens:*", "notas:*", "clientes:visualizar", "fornecedores:visualizar", "veiculos:visualizar", "motoristas:visualizar"]')
      ON CONFLICT (id) DO NOTHING;
      
      INSERT INTO roles (id, name, description, permissions) VALUES
      (4, 'leitor', 'Leitor', '["*:visualizar"]')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Criar usuário admin padrão (senha: admin123)
    try {
      const bcrypt = (await import('bcryptjs')).default;
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (username, email, password, role_id, active) VALUES
        ('admin', 'admin@admin.com', $1, 1, true)
        ON CONFLICT (username) DO NOTHING;
      `, [hashedPassword]);
    } catch (err) {
      console.log('Usuário admin já existe ou erro ao criar:', err.message);
    }

    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

// Iniciar servidor
app.listen(PORT, async () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  await initDatabase();
});

export default app;

