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

O projeto segue **Clean Architecture** com separação clara entre domínio, persistência e interface:

```
src/
  app/              # router, providers, layouts, stores globais (Zustand)
  pages/            # telas e composições de página
  features/         # módulo por domínio
    ├── {feature}/
    │   ├── components/    # React components
    │   ├── hooks/         # Custom hooks com React Query
    │   ├── services/      # Orquestração de negócio
    │   ├── validators/    # Validação com Zod
    │   └── types/         # DTOs e tipos específicos
  data/             # persistência
    ├── db/          # conexão e schema SQLite
    └── repositories/ # mappers + chamadas HTTP
  domain/           # lógica pura
    ├── entities/    # tipos de negócio
    ├── enums/       # constantes de domínio
    ├── rules/       # funções puras de negócio com testes
    ├── errors/      # classes de erro específicas
    ├── mappers/     # transformação API → Domain
    └── usecases/    # orquestração complexa
  shared/           # componentes e utilitários reutilizáveis
```

**Princípios aplicados:**
- ✅ **Lógica pesada fora das páginas** — concentrada em domain/rules e services
- ✅ **Tipagem forte** — TypeScript strict + validação Zod em todas as entradas
- ✅ **Regras críticas testadas** — 114 testes unitários cobrindo 97% do código
- ✅ **Padrões SOLID** — Mappers, Error classes, Custom hooks, Use cases

**Padrões implementados:**
- ✅ **Mappers** — Transformação centralizadas API ↔ Domain (4 mappers, zero duplicação)
- ✅ **Domain Errors** — Hierarquia de erros específicos com type guards e status HTTP
- ✅ **Custom Hooks** — React Query encapsulado por feature (13 hooks, cache gerenciado)
- ✅ **Services** — Orquestração de regras de negócio antes de persistência
- ✅ **Use Cases** — Padrão para lógica complexa multi-repositório com DI
- ✅ **Unit Tests** — 114 testes com Vitest (97% cobertura domain/rules)

---

## 🧪 Testes

Projeto implementa testes unitários para **regras críticas de negócio**:

```bash
# Executar testes uma vez
npm run test

# Modo watch para desenvolvimento
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

**Cobertura:**
- Domain rules (preço, estoque, venda) — 40 testes
- Error handling e mappers — 37 testes
- Services com validação — 37 testes
- **Total: 114 testes · 97% cobertura**

Veja [TESTING_GUIDE.md](./TESTING_GUIDE.md) para documentação completa.

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

**Testing:** Vitest 1.1 · @testing-library/react · jsdom · 114 testes unitários

**Backend (desktop):** Tauri 2 · Rust · rusqlite · Argon2

**Banco de dados:** SQLite (10 tabelas — usuários, produtos, clientes, vendas, estoque, caixa e mais)

---

## Como rodar localmente

**Pré-requisitos:** Node.js 20+, npm, Rust toolchain estável, dependências nativas Tauri (Windows: WebView2 + Build Tools)

```bash
# Instalar dependências (incluindo Vitest)
npm install

# Rodar todos os testes
npm run test

# Rodar em modo desenvolvimento (desktop)
npm run tauri dev

# Build para produção
npm run tauri build
```

**Credential padrão do seed:**
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
