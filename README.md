# NEXLOJA

Aplicativo desktop para gerenciamento de loja, construido com Tauri + React + TypeScript, com persistencia local em SQLite.

Este projeto foi estruturado como base de sistema real (MVP funcional), com foco em:
- arquitetura limpa por camadas
- consistencia entre dominio, banco e UI
- fluxos de operacao de loja (estoque, caixa e vendas)

## Visao geral da V1

Modulos cobertos:
- autenticacao com perfis `ADMIN` e `VENDEDOR`
- dashboard com indicadores operacionais
- produtos (CRUD + inativacao logica)
- clientes (CRUD + inativacao logica)
- estoque (consulta + movimentacoes + historico)
- caixa (abertura, sessao atual, fechamento, movimentos)
- vendas (nova venda, historico, detalhe, cancelamento)
- relatorios (vendas por periodo, mais vendidos, estoque atual, estoque baixo)
- configuracoes da loja

## Stack

- Tauri 2
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- SQLite (via `rusqlite` no backend Rust)

## Arquitetura de pastas

```txt
src/
  app/          # router, providers, layouts, stores globais
  pages/        # telas
  features/     # modulo por dominio (componentes, services, validators)
  data/         # db, repositories, mappers
  domain/       # entidades, enums, regras de negocio puras
  shared/       # componentes e utilitarios reutilizaveis
  styles/

src-tauri/
  src/main.rs   # comandos Tauri, schema SQLite, seed e regras transacionais
```

## Banco de dados (SQLite)

Tabelas da V1:
- `usuarios`
- `configuracao_loja`
- `categorias`
- `produtos`
- `clientes`
- `caixa_sessoes`
- `vendas`
- `itens_venda`
- `movimentacoes_estoque`
- `caixa_movimentos`

O backend garante criacao/atualizacao de estrutura e seed inicial na inicializacao da aplicacao.

## Seed inicial

Credencial padrao:
- login: `admin`
- senha: `admin123`

Tambem sao inseridos dados iniciais de:
- configuracao da loja
- categorias base

## Regras de negocio principais

- produto com codigo unico
- valores monetarios e estoque nao negativos
- venda exige caixa aberto para usuario atual
- venda nao finaliza sem item e sem estoque suficiente
- finalizar venda baixa estoque e registra movimentos (estoque + caixa)
- cancelar venda devolve estoque e marca venda como `CANCELADA`
- vendas canceladas nao entram em faturamento
- controle de sessao de caixa por usuario (nao permite duas sessoes abertas)
- senhas armazenadas com hash (Argon2)

## Pre-requisitos

Para rodar localmente:
- Node.js 20+ (recomendado)
- npm
- Rust toolchain estavel
- Dependencias nativas do Tauri para Windows (WebView2/Build Tools)

## Como executar

1. Instalar dependencias

```bash
npm install
```

2. Rodar frontend web (desenvolvimento)

```bash
npm run dev
```

3. Rodar app desktop Tauri (desenvolvimento)

```bash
npm run tauri dev
```

## Build

Build web:

```bash
npm run build
```

Build desktop:

```bash
npm run tauri build
```

## Scripts disponiveis

- `npm run dev` -> inicia Vite
- `npm run build` -> typecheck + build web
- `npm run preview` -> preview do build web
- `npm run tauri <cmd>` -> comandos Tauri (`dev`, `build`, etc.)

## Rotas principais

- `/login`
- `/dashboard`
- `/produtos`
- `/estoque`
- `/clientes`
- `/vendas`
- `/relatorios`
- `/configuracoes`
- `/caixa/abrir`
- `/caixa/fechar`

## Qualidade e evolucao

Diretrizes desta base:
- evitar logica pesada nas paginas
- concentrar persistencia em repositories
- manter regras criticas no dominio/backend
- preservar tipagem forte e validacao de formularios com Zod

Objetivo da V1: estabilidade operacional e base pronta para evolucao de novas features sem refatoracao estrutural.
