# 🔧 Instalação de Dependências

## Problema Identificado

O erro `Failed to resolve import "tailwind-merge"` indica que as dependências não foram instaladas ainda, mesmo estando no `package.json`.

## Solução

Execute no diretório `frontend`:

```bash
cd frontend
npm install
```

Isso irá instalar todas as dependências, incluindo:
- `clsx` (já instalado)
- `tailwind-merge` (precisa instalar)

## Verificação

Após a instalação, você pode verificar se as dependências estão instaladas:

```bash
npm list clsx tailwind-merge
```

Ou verificar manualmente:
- `frontend/node_modules/clsx/`
- `frontend/node_modules/tailwind-merge/`

## Outras Correções Aplicadas

1. ✅ **DetailLayout** - Corrigido uso de `Tabs.Tab` para `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`
2. ✅ **Conciliacao.jsx** - Substituído `confirm()` e `alert()` por `ConfirmModal` e `toast`
3. ✅ **Importacao.jsx** - Adicionado `toast` para feedback

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Instalar dependência específica (se necessário)
npm install clsx tailwind-merge

# Verificar instalação
npm list --depth=0
```

