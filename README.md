<div align="center">

# NexLoja

**Sistema completo de gerenciamento de loja — desktop, offline, produção-ready.**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tauri](https://img.shields.io/badge/Tauri_2-FFC131?style=flat-square&logo=tauri&logoColor=black)](https://tauri.app/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)

> Aplicativo desktop para gerenciamento completo de loja física — estoque, caixa, vendas e relatórios — construído com Tauri + React + TypeScript e persistência local em SQLite.

<!-- 💡 Adicione um screenshot aqui: -->
<!-- ![NexLoja Dashboard](./docs/screenshot-dashboard.png) -->

</div>

---

## O que o sistema faz

| Módulo | Funcionalidades |
|---|---|
| 🔐 **Autenticação** | Perfis ADMIN e VENDEDOR com senhas em Argon2 |
| 📊 **Dashboard** | Indicadores operacionais em tempo real |
| 📦 **Produtos** | CRUD completo + inativação lógica + controle de estoque |
| 👥 **Clientes** | Cadastro completo com histórico de compras |
| 💰 **Caixa** | Abertura, sessão ativa, fechamento e movimentos |
| 🛒 **Vendas** | Nova venda, histórico, detalhes e cancelamento |
| 📈 **Relatórios** | Vendas por período, mais vendidos, estoque atual e crítico |

---

## Arquitetura

O projeto segue arquitetura em camadas, com separação clara entre domínio, persistência e interface:

```
src/
  app/          # router, providers, layouts, stores globais
  pages/        # telas
  features/     # módulo por domínio (componentes, services, validators)
  data/         # db, repositories, mappers
  domain/       # entidades, enums, regras de negócio puras
  shared/       # componentes e utilitários reutilizáveis

src-tauri/
  src/main.rs   # comandos Tauri, schema SQLite, seed e regras transacionais
```

**Princípios aplicados:**
- Lógica pesada fora das páginas — concentrada em `repositories` e `domain`
- Tipagem forte com TypeScript + validação de formulários com Zod
- Regras críticas de negócio executadas no backend Rust (via Tauri)

---

## Regras de negócio principais

- Venda só finaliza com caixa aberto pelo usuário atual
- Finalizar venda baixa estoque e registra movimentos automaticamente
- Cancelamento de venda devolve estoque e exclui do faturamento
- Controle de sessão de caixa por usuário (sem sessões duplicadas)
- Produto com código único; valores monetários e estoque nunca negativos

---

## Stack completa

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router · TanStack Query · Zustand · React Hook Form · Zod

**Backend (desktop):** Tauri 2 · Rust · rusqlite · Argon2

**Banco de dados:** SQLite (10 tabelas — usuários, produtos, clientes, vendas, estoque, caixa e mais)

---

## Como rodar localmente

**Pré-requisitos:** Node.js 20+, npm, Rust toolchain estável, dependências nativas Tauri (Windows: WebView2 + Build Tools)

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento (desktop)
npm run tauri dev

# Build para produção
npm run tauri build
```

**Credencial padrão do seed:**
```
login: admin
senha: admin123
```

---

## Banco de dados

Schema com 10 tabelas criado e migrado automaticamente na inicialização:

`usuarios` · `configuracao_loja` · `categorias` · `produtos` · `clientes` · `caixa_sessoes` · `vendas` · `itens_venda` · `movimentacoes_estoque` · `caixa_movimentos`

---

<div align="center">

Feito por [Nicolas Cardoso](https://github.com/NicolasCardoso2) · [LinkedIn](https://www.linkedin.com/in/nicolas-cardoso-vilha-do-lago-2483b1322/)

</div>
