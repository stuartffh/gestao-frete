-- ============================================================================
-- Script de Inicializa��o do Banco de Dados - Sistema de Gest�o de Fretes
-- ============================================================================
-- Este script cria todas as tabelas necess�rias para o sistema
-- Executar apenas uma vez na primeira inicializa��o
-- ============================================================================

-- Extens�es
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- RBAC (Role-Based Access Control)
-- ============================================================================

-- Tabela de Roles (Fun��es/Cargos)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usu�rios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(255),
    role_id INTEGER REFERENCES roles(id),
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Auditoria
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, etc
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Cadastros Base
-- ============================================================================

-- Motoristas
CREATE TABLE IF NOT EXISTS motoristas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    cnh VARCHAR(20) UNIQUE NOT NULL,
    categoria_cnh VARCHAR(5),
    vencimento_cnh DATE,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    data_nascimento DATE,
    data_admissao DATE,
    observacoes TEXT,
    foto_url VARCHAR(255),
    active BOOLEAN DEFAULT true,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Ve�culos
CREATE TABLE IF NOT EXISTS veiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Caminh�o, Carreta, Utilit�rio, etc
    marca VARCHAR(100),
    modelo VARCHAR(100),
    ano INTEGER,
    cor VARCHAR(50),
    renavam VARCHAR(20),
    chassi VARCHAR(30),
    capacidade_kg DECIMAL(10,2),
    capacidade_m3 DECIMAL(10,2),
    proprietario VARCHAR(100), -- Pr�prio, Terceiro
    valor_fipe DECIMAL(12,2),
    km_atual INTEGER,
    vencimento_ipva DATE,
    vencimento_seguro DATE,
    observacoes TEXT,
    foto_url VARCHAR(255),
    active BOOLEAN DEFAULT true,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL, -- PF (Pessoa F�sica) ou PJ (Pessoa Jur�dica)
    nome VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    rg_ie VARCHAR(20),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(100),
    endereco TEXT,
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================================================
-- Gest�o de Viagens e Ordens de Servi�o
-- ============================================================================

CREATE TABLE IF NOT EXISTS viagens (
    id SERIAL PRIMARY KEY,
    numero_os VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INTEGER REFERENCES clientes(id),
    motorista_id INTEGER REFERENCES motoristas(id),
    veiculo_id INTEGER REFERENCES veiculos(id),

    -- Origem e Destino
    origem_endereco TEXT,
    origem_cidade VARCHAR(100),
    origem_estado VARCHAR(2),
    origem_cep VARCHAR(10),
    destino_endereco TEXT,
    destino_cidade VARCHAR(100),
    destino_estado VARCHAR(2),
    destino_cep VARCHAR(10),

    -- Datas
    data_coleta DATE,
    hora_coleta TIME,
    data_entrega DATE,
    hora_entrega TIME,
    data_saida TIMESTAMP,
    data_chegada TIMESTAMP,

    -- Carga
    descricao_carga TEXT,
    peso_kg DECIMAL(10,2),
    volume_m3 DECIMAL(10,2),
    quantidade_volumes INTEGER,
    valor_carga DECIMAL(12,2),

    -- Financeiro
    valor_frete DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_pedagio DECIMAL(12,2) DEFAULT 0,
    valor_combustivel DECIMAL(12,2) DEFAULT 0,
    outras_despesas DECIMAL(12,2) DEFAULT 0,
    valor_total DECIMAL(12,2) DEFAULT 0,

    -- Status e Controle
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, em_transito, entregue, cancelada
    km_inicial INTEGER,
    km_final INTEGER,
    km_percorrido INTEGER,

    observacoes TEXT,
    anexos JSONB DEFAULT '[]'::jsonb,

    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================================================
-- Notas Fiscais
-- ============================================================================

CREATE TABLE IF NOT EXISTS notas_fiscais (
    id SERIAL PRIMARY KEY,
    viagem_id INTEGER REFERENCES viagens(id),
    numero_nota VARCHAR(50) NOT NULL,
    serie VARCHAR(10),
    chave_acesso VARCHAR(44),
    tipo VARCHAR(20) NOT NULL, -- entrada, saida
    cliente_fornecedor_id INTEGER REFERENCES clientes(id),
    data_emissao DATE NOT NULL,
    data_vencimento DATE,
    valor_total DECIMAL(12,2) NOT NULL,
    descricao TEXT,
    xml_url VARCHAR(255),
    pdf_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'emitida', -- emitida, cancelada
    observacoes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================================================
-- Gest�o Financeira - Contas a Pagar e Receber
-- ============================================================================

CREATE TABLE IF NOT EXISTS contas_pagar (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100), -- Combust�vel, Manuten��o, Sal�rios, etc
    fornecedor_id INTEGER REFERENCES clientes(id),
    viagem_id INTEGER REFERENCES viagens(id),
    valor DECIMAL(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_pago DECIMAL(12,2),
    forma_pagamento VARCHAR(50), -- Dinheiro, PIX, Boleto, etc
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, pago, atrasado, cancelado
    observacoes TEXT,
    comprovante_url VARCHAR(255),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contas_receber (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100), -- Frete, Servi�o, etc
    cliente_id INTEGER REFERENCES clientes(id),
    viagem_id INTEGER REFERENCES viagens(id),
    valor DECIMAL(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    valor_recebido DECIMAL(12,2),
    forma_recebimento VARCHAR(50), -- Dinheiro, PIX, Boleto, etc
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, recebido, atrasado, cancelado
    observacoes TEXT,
    comprovante_url VARCHAR(255),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================================================
-- Parcelas e Recorr�ncias
-- ============================================================================

CREATE TABLE IF NOT EXISTS parcelas (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL, -- pagar, receber
    referencia_id INTEGER NOT NULL, -- ID da conta_pagar ou conta_receber original
    numero_parcela INTEGER NOT NULL,
    total_parcelas INTEGER NOT NULL,
    descricao VARCHAR(255),
    valor DECIMAL(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_pago DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'pendente',
    observacoes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recorrencias (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- pagar, receber
    categoria VARCHAR(100),
    valor DECIMAL(12,2) NOT NULL,
    frequencia VARCHAR(50) NOT NULL, -- mensal, semanal, anual, etc
    dia_vencimento INTEGER,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    ativo BOOLEAN DEFAULT true,
    ultima_geracao DATE,
    proxima_geracao DATE,
    observacoes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Caixa e Movimenta��es
-- ============================================================================

CREATE TABLE IF NOT EXISTS caixa (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL, -- entrada, saida
    categoria VARCHAR(100),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
    forma_pagamento VARCHAR(50),
    conta_pagar_id INTEGER REFERENCES contas_pagar(id),
    conta_receber_id INTEGER REFERENCES contas_receber(id),
    viagem_id INTEGER REFERENCES viagens(id),
    observacoes TEXT,
    comprovante_url VARCHAR(255),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Alertas e Notifica��es
-- ============================================================================

CREATE TABLE IF NOT EXISTS alertas (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- vencimento_cnh, vencimento_ipva, conta_vencer, etc
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    severidade VARCHAR(20) DEFAULT 'info', -- info, warning, error
    data_alerta DATE NOT NULL,
    referencia_tipo VARCHAR(50), -- motorista, veiculo, conta_pagar, etc
    referencia_id INTEGER,
    visualizado BOOLEAN DEFAULT false,
    data_visualizacao TIMESTAMP,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- �ndices para Performance
-- ============================================================================

-- Usu�rios e Auth
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Auditoria
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- Cadastros
CREATE INDEX IF NOT EXISTS idx_motoristas_cpf ON motoristas(cpf);
CREATE INDEX IF NOT EXISTS idx_motoristas_active ON motoristas(active);
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON veiculos(placa);
CREATE INDEX IF NOT EXISTS idx_veiculos_active ON veiculos(active);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);

-- Viagens
CREATE INDEX IF NOT EXISTS idx_viagens_os ON viagens(numero_os);
CREATE INDEX IF NOT EXISTS idx_viagens_status ON viagens(status);
CREATE INDEX IF NOT EXISTS idx_viagens_cliente ON viagens(cliente_id);
CREATE INDEX IF NOT EXISTS idx_viagens_motorista ON viagens(motorista_id);
CREATE INDEX IF NOT EXISTS idx_viagens_data_coleta ON viagens(data_coleta);

-- Financeiro
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_tipo_ref ON parcelas(tipo, referencia_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas(data_vencimento);

-- Caixa
CREATE INDEX IF NOT EXISTS idx_caixa_data ON caixa(data_movimento);
CREATE INDEX IF NOT EXISTS idx_caixa_tipo ON caixa(tipo);

-- Alertas
CREATE INDEX IF NOT EXISTS idx_alertas_data ON alertas(data_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_visualizado ON alertas(visualizado);
CREATE INDEX IF NOT EXISTS idx_alertas_user ON alertas(user_id);

-- ============================================================================
-- Dados Iniciais (Seed Data)
-- ============================================================================

-- Roles Padr�o
INSERT INTO roles (name, description, permissions) VALUES
('Admin', 'Administrador do sistema com acesso total',
 '["*:*"]'::jsonb),
('Gerente', 'Gerente com permiss�es de supervis�o',
 '["motoristas:*", "veiculos:*", "clientes:*", "viagens:*", "contas_pagar:visualizar", "contas_receber:*", "relatorios:*"]'::jsonb),
('Operador', 'Operador com permiss�es b�sicas',
 '["viagens:visualizar", "viagens:criar", "motoristas:visualizar", "veiculos:visualizar", "clientes:visualizar"]'::jsonb),
('Financeiro', 'Respons�vel pela �rea financeira',
 '["contas_pagar:*", "contas_receber:*", "parcelas:*", "caixa:*", "relatorios:financeiro"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Usu�rio Admin Padr�o (senha: admin123)
-- IMPORTANTE: ALTERE A SENHA EM PRODU��O!
INSERT INTO users (username, email, password, nome_completo, role_id, active) VALUES
('admin', 'admin@gestao-frete.com', '$2a$10$X8qJ3Q7Z9Y.K8xN5W2fZJO4YzJ1vK3hX6mQ2wR5tY7uP8nV9kL1mG', 'Administrador do Sistema', 1, true)
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- Triggers para updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;

-- ============================================================================
-- Views �teis para relat�rios
-- ============================================================================

-- View de viagens com informa��es completas
CREATE OR REPLACE VIEW vw_viagens_completas AS
SELECT
    v.*,
    c.nome as cliente_nome,
    c.cpf_cnpj as cliente_documento,
    m.nome as motorista_nome,
    m.cnh as motorista_cnh,
    ve.placa as veiculo_placa,
    ve.modelo as veiculo_modelo,
    u.username as criado_por
FROM viagens v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN motoristas m ON v.motorista_id = m.id
LEFT JOIN veiculos ve ON v.veiculo_id = ve.id
LEFT JOIN users u ON v.user_id = u.id
WHERE v.deleted_at IS NULL;

-- View de contas a pagar pendentes
CREATE OR REPLACE VIEW vw_contas_pagar_pendentes AS
SELECT
    cp.*,
    c.nome as fornecedor_nome,
    v.numero_os,
    CASE
        WHEN cp.data_vencimento < CURRENT_DATE THEN 'atrasado'
        WHEN cp.data_vencimento = CURRENT_DATE THEN 'vence_hoje'
        ELSE 'pendente'
    END as situacao
FROM contas_pagar cp
LEFT JOIN clientes c ON cp.fornecedor_id = c.id
LEFT JOIN viagens v ON cp.viagem_id = v.id
WHERE cp.status = 'pendente' AND cp.deleted_at IS NULL
ORDER BY cp.data_vencimento;

-- View de contas a receber pendentes
CREATE OR REPLACE VIEW vw_contas_receber_pendentes AS
SELECT
    cr.*,
    c.nome as cliente_nome,
    v.numero_os,
    CASE
        WHEN cr.data_vencimento < CURRENT_DATE THEN 'atrasado'
        WHEN cr.data_vencimento = CURRENT_DATE THEN 'vence_hoje'
        ELSE 'pendente'
    END as situacao
FROM contas_receber cr
LEFT JOIN clientes c ON cr.cliente_id = c.id
LEFT JOIN viagens v ON cr.viagem_id = v.id
WHERE cr.status = 'pendente' AND cr.deleted_at IS NULL
ORDER BY cr.data_vencimento;

-- ============================================================================
-- Triggers para cálculos automáticos
-- ============================================================================

-- Trigger para calcular valor_total e km_percorrido em viagens
CREATE OR REPLACE FUNCTION calculate_viagem_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular valor_total
    NEW.valor_total := COALESCE(NEW.valor_frete, 0) +
                       COALESCE(NEW.valor_pedagio, 0) +
                       COALESCE(NEW.valor_combustivel, 0) +
                       COALESCE(NEW.outras_despesas, 0);

    -- Calcular km_percorrido
    IF NEW.km_final IS NOT NULL AND NEW.km_inicial IS NOT NULL THEN
        NEW.km_percorrido := NEW.km_final - NEW.km_inicial;
    ELSE
        NEW.km_percorrido := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_viagem_fields
BEFORE INSERT OR UPDATE ON viagens
FOR EACH ROW
EXECUTE FUNCTION calculate_viagem_fields();

-- ============================================================================
-- Finalização
-- ============================================================================

-- Coment�rio informativo
COMMENT ON DATABASE CURRENT_DATABASE() IS 'Sistema de Gest�o de Fretes - Banco de Dados Inicializado';

SELECT 'Banco de dados inicializado com sucesso!' AS status;
