use std::fs;
use std::path::PathBuf;

use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::Argon2;
use rusqlite::types::Value;
use rusqlite::{params, params_from_iter, Connection};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri::Manager;
use uuid::Uuid;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UsuarioSessao {
    id: i64,
    login: String,
    nome: String,
    perfil: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LoginResponse {
    token: String,
    usuario: UsuarioSessao,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CategoriaListItem {
    id: i64,
    nome: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProdutoListItem {
    id: i64,
    codigo: String,
    nome: String,
    codigo_barras: Option<String>,
    categoria_id: i64,
    categoria_nome: String,
    preco_venda: f64,
    estoque_atual: f64,
    ativo: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProdutoDetalhe {
    id: i64,
    codigo: String,
    nome: String,
    categoria_id: i64,
    categoria_nome: String,
    preco_venda: f64,
    estoque_atual: f64,
    estoque_minimo: f64,
    ativo: bool,
    codigo_barras: Option<String>,
    descricao: Option<String>,
    marca: Option<String>,
    preco_custo: f64,
    unidade: String,
    imagem_path: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProdutoListFilters {
    query: Option<String>,
    categoria_id: Option<i64>,
    ativo: Option<bool>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpsertProdutoPayload {
    codigo: String,
    nome: String,
    categoria_id: i64,
    preco_venda: f64,
    estoque_atual: f64,
    estoque_minimo: f64,
    ativo: bool,
    codigo_barras: Option<String>,
    descricao: Option<String>,
    marca: Option<String>,
    preco_custo: Option<f64>,
    unidade: Option<String>,
    imagem_path: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ClienteListItem {
    id: i64,
    nome: String,
    cpf: Option<String>,
    telefone: Option<String>,
    email: Option<String>,
    ativo: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ClienteResumoCompras {
    quantidade_vendas: i64,
    total_gasto: f64,
    ultima_compra_em: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ClienteDetalhe {
    id: i64,
    nome: String,
    cpf: Option<String>,
    telefone: Option<String>,
    email: Option<String>,
    endereco: Option<String>,
    observacoes: Option<String>,
    ativo: bool,
    resumo_compras: ClienteResumoCompras,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ClienteListFilters {
    query: Option<String>,
    ativo: Option<bool>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpsertClientePayload {
    nome: String,
    cpf: Option<String>,
    telefone: Option<String>,
    email: Option<String>,
    endereco: Option<String>,
    observacoes: Option<String>,
    ativo: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct EstoqueItem {
    produto_id: i64,
    codigo: String,
    nome: String,
    categoria_id: i64,
    categoria_nome: String,
    estoque_atual: f64,
    estoque_minimo: f64,
    status_estoque: String,
    ativo: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MovimentacaoEstoqueItem {
    id: i64,
    produto_id: i64,
    produto_nome: String,
    produto_codigo: String,
    tipo: String,
    quantidade: f64,
    estoque_antes: f64,
    estoque_depois: f64,
    motivo: String,
    observacao: Option<String>,
    usuario_id: i64,
    criado_em: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProdutoMovimentacaoOption {
    id: i64,
    codigo: String,
    nome: String,
    ativo: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EstoqueFilters {
    query: Option<String>,
    categoria_id: Option<i64>,
    apenas_estoque_baixo: Option<bool>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MovimentacaoFilters {
    produto_id: Option<i64>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegistrarMovimentacaoPayload {
    produto_id: i64,
    usuario_id: i64,
    tipo: String,
    quantidade: f64,
    motivo: String,
    observacao: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CaixaSessaoAtual {
    id: i64,
    usuario_id: i64,
    aberto_em: String,
    fechado_em: Option<String>,
    valor_abertura: f64,
    valor_fechamento: Option<f64>,
    valor_sistema: Option<f64>,
    diferenca: Option<f64>,
    status: String,
    observacao: Option<String>,
    total_movimentos: i64,
    valor_final_calculado: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CaixaMovimentoItem {
    id: i64,
    tipo: String,
    valor: f64,
    observacao: Option<String>,
    criado_em: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AbrirCaixaPayload {
    usuario_id: i64,
    valor_inicial: f64,
    observacoes: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FecharCaixaPayload {
    usuario_id: i64,
    valor_final_informado: f64,
    observacoes: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProdutoVendaBuscaItem {
    id: i64,
    codigo: String,
    codigo_barras: Option<String>,
    nome: String,
    preco_venda: f64,
    estoque_atual: f64,
    ativo: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VendaListItem {
    id: i64,
    numero_venda: String,
    criado_em: String,
    cliente_nome: Option<String>,
    usuario_nome: String,
    forma_pagamento: String,
    total: f64,
    status: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VendaItemDetalhe {
    produto_id: i64,
    produto_nome: String,
    produto_codigo: String,
    quantidade: f64,
    preco_unitario: f64,
    subtotal: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VendaDetalhe {
    id: i64,
    numero_venda: String,
    criado_em: String,
    cliente_id: Option<i64>,
    cliente_nome: Option<String>,
    usuario_id: i64,
    usuario_nome: String,
    caixa_sessao_id: i64,
    forma_pagamento: String,
    subtotal: f64,
    desconto: f64,
    total: f64,
    status: String,
    cancelado_em: Option<String>,
    motivo_cancelamento: Option<String>,
    itens: Vec<VendaItemDetalhe>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VendaListFilters {
    data_inicio: Option<String>,
    data_fim: Option<String>,
    cliente_id: Option<i64>,
    status: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FinalizarVendaItemPayload {
    produto_id: i64,
    quantidade: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FinalizarVendaPayload {
    usuario_id: i64,
    cliente_id: Option<i64>,
    desconto: f64,
    forma_pagamento: String,
    itens: Vec<FinalizarVendaItemPayload>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CancelarVendaPayload {
    venda_id: i64,
    usuario_id: i64,
    motivo: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DashboardUltimaVendaItem {
    numero_venda: String,
    criado_em: String,
    cliente_nome: Option<String>,
    total: f64,
    forma_pagamento: String,
    status: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DashboardProdutoMaisVendidoItem {
    produto_nome: String,
    quantidade_vendida: f64,
    total_vendido: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DashboardCaixaAtual {
    status: String,
    aberto_em: Option<String>,
    valor_inicial: Option<f64>,
    valor_movimentado: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DashboardResumo {
    total_vendido_dia: f64,
    quantidade_vendas_dia: i64,
    ticket_medio_dia: f64,
    produtos_estoque_baixo: i64,
    produtos_zerados: i64,
    caixa_atual: DashboardCaixaAtual,
    ultimas_vendas: Vec<DashboardUltimaVendaItem>,
    produtos_mais_vendidos: Vec<DashboardProdutoMaisVendidoItem>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioVendaItem {
    numero_venda: String,
    criado_em: String,
    cliente_nome: Option<String>,
    usuario_nome: String,
    forma_pagamento: String,
    subtotal: f64,
    desconto: f64,
    total: f64,
    status: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioVendasResumo {
    quantidade_vendas: i64,
    total_vendido_finalizadas: f64,
    total_descontos_finalizadas: f64,
    ticket_medio_finalizadas: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioVendasResponse {
    itens: Vec<RelatorioVendaItem>,
    resumo: RelatorioVendasResumo,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioProdutoMaisVendidoItem {
    produto_nome: String,
    produto_codigo: String,
    categoria_nome: String,
    quantidade_vendida: f64,
    total_vendido: f64,
    preco_medio_praticado: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioEstoqueItem {
    codigo: String,
    produto_nome: String,
    categoria_nome: String,
    estoque_atual: f64,
    estoque_minimo: f64,
    status_estoque: String,
    ativo: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioEstoqueBaixoItem {
    codigo: String,
    produto_nome: String,
    categoria_nome: String,
    estoque_atual: f64,
    estoque_minimo: f64,
    diferenca_reposicao: f64,
    status_estoque: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioVendasFilters {
    data_inicio: Option<String>,
    data_fim: Option<String>,
    cliente_id: Option<i64>,
    status: Option<String>,
    forma_pagamento: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioProdutosVendidosFilters {
    data_inicio: Option<String>,
    data_fim: Option<String>,
    categoria_id: Option<i64>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioEstoqueFilters {
    query: Option<String>,
    categoria_id: Option<i64>,
    ativo: Option<bool>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RelatorioEstoqueBaixoFilters {
    query: Option<String>,
    categoria_id: Option<i64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ConfiguracaoLoja {
    id: i64,
    nome_loja: String,
    cnpj: Option<String>,
    telefone: Option<String>,
    email: Option<String>,
    endereco: Option<String>,
    logo_path: Option<String>,
    tema: String,
    moeda: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpsertConfiguracaoLojaPayload {
    nome_loja: String,
    cnpj: Option<String>,
    telefone: Option<String>,
    email: Option<String>,
    endereco: Option<String>,
    logo_path: Option<String>,
    tema: String,
    moeda: String,
}

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    Ok(app_data_dir.join("nexloja.db"))
}

fn open_connection(app: &AppHandle) -> Result<Connection, String> {
    let db_path = database_path(app)?;
    Connection::open(db_path).map_err(|e| format!("Falha ao abrir banco: {e}"))
}

fn hash_password(password: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| format!("Falha ao gerar hash: {e}"))
}

fn verify_password(hash: &str, password: &str) -> Result<bool, String> {
    let parsed_hash = PasswordHash::new(hash).map_err(|e| format!("Hash invalido: {e}"))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

fn ensure_schema(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          login TEXT NOT NULL UNIQUE,
          nome TEXT NOT NULL,
          senha_hash TEXT NOT NULL,
          perfil TEXT NOT NULL CHECK (perfil IN ('ADMIN', 'VENDEDOR')),
          ativo INTEGER NOT NULL DEFAULT 1,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          atualizado_em TEXT
        );

        CREATE TABLE IF NOT EXISTS configuracao_loja (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome_loja TEXT NOT NULL DEFAULT 'NEXLOJA',
          nome_fantasia TEXT NOT NULL,
          razao_social TEXT,
          cnpj TEXT,
          telefone TEXT,
          email TEXT,
          endereco TEXT,
          logo_path TEXT,
          tema TEXT NOT NULL DEFAULT 'light',
          moeda TEXT NOT NULL DEFAULT 'BRL',
          atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL UNIQUE,
          ativo INTEGER NOT NULL DEFAULT 1,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS produtos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo TEXT NOT NULL UNIQUE,
          codigo_barras TEXT,
          nome TEXT NOT NULL,
          descricao TEXT,
          marca TEXT,
          categoria_id INTEGER NOT NULL,
          preco_venda REAL NOT NULL CHECK (preco_venda >= 0),
          preco_custo REAL NOT NULL DEFAULT 0 CHECK (preco_custo >= 0),
          unidade TEXT NOT NULL DEFAULT 'UN',
          imagem_path TEXT,
          estoque_atual REAL NOT NULL DEFAULT 0 CHECK (estoque_atual >= 0),
          estoque_minimo REAL NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
          ativo INTEGER NOT NULL DEFAULT 1,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          atualizado_em TEXT,
          FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        );

        CREATE TABLE IF NOT EXISTS clientes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          cpf TEXT,
          email TEXT,
          telefone TEXT,
          endereco TEXT,
          observacoes TEXT,
          ativo INTEGER NOT NULL DEFAULT 1,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          atualizado_em TEXT
        );

        CREATE TABLE IF NOT EXISTS caixa_sessoes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_abertura_id INTEGER NOT NULL,
          usuario_fechamento_id INTEGER,
          aberto_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          fechado_em TEXT,
          valor_abertura REAL NOT NULL CHECK (valor_abertura >= 0),
          valor_fechamento REAL,
          valor_sistema REAL,
          status TEXT NOT NULL CHECK (status IN ('ABERTO', 'FECHADO')),
          observacao TEXT,
          FOREIGN KEY (usuario_abertura_id) REFERENCES usuarios(id),
          FOREIGN KEY (usuario_fechamento_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS vendas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          numero_venda TEXT NOT NULL UNIQUE,
          caixa_sessao_id INTEGER NOT NULL,
          cliente_id INTEGER,
          usuario_id INTEGER NOT NULL,
          subtotal REAL NOT NULL CHECK (subtotal >= 0),
          desconto REAL NOT NULL DEFAULT 0 CHECK (desconto >= 0),
          total REAL NOT NULL CHECK (total >= 0),
          forma_pagamento TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('FINALIZADA', 'CANCELADA')),
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          cancelado_em TEXT,
          motivo_cancelamento TEXT,
          FOREIGN KEY (caixa_sessao_id) REFERENCES caixa_sessoes(id),
          FOREIGN KEY (cliente_id) REFERENCES clientes(id),
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS itens_venda (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          venda_id INTEGER NOT NULL,
          produto_id INTEGER NOT NULL,
          quantidade REAL NOT NULL CHECK (quantidade > 0),
          preco_unitario REAL NOT NULL CHECK (preco_unitario >= 0),
          subtotal REAL NOT NULL CHECK (subtotal >= 0),
          FOREIGN KEY (venda_id) REFERENCES vendas(id),
          FOREIGN KEY (produto_id) REFERENCES produtos(id)
        );

        CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          produto_id INTEGER NOT NULL,
          usuario_id INTEGER NOT NULL,
          tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA', 'AJUSTE', 'VENDA', 'CANCELAMENTO_VENDA')),
          quantidade REAL NOT NULL,
          estoque_antes REAL NOT NULL,
          estoque_depois REAL NOT NULL,
          origem TEXT NOT NULL,
          referencia_id INTEGER,
          observacao TEXT,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (produto_id) REFERENCES produtos(id),
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS caixa_movimentos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          caixa_sessao_id INTEGER NOT NULL,
          usuario_id INTEGER NOT NULL,
          tipo TEXT NOT NULL CHECK (tipo IN ('ABERTURA', 'VENDA', 'SANGRIA', 'SUPRIMENTO', 'FECHAMENTO', 'ESTORNO')),
          valor REAL NOT NULL,
          referencia_id INTEGER,
          observacao TEXT,
          criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (caixa_sessao_id) REFERENCES caixa_sessoes(id),
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
        ",
    )
    .map_err(|e| format!("Falha ao criar schema: {e}"))?;

    ensure_configuracao_columns(conn)?;
    ensure_produtos_columns(conn)?;
    ensure_clientes_columns(conn)?;
    ensure_vendas_columns(conn)?;
    Ok(())
}

fn has_column(conn: &Connection, table_name: &str, column_name: &str) -> Result<bool, String> {
    let mut stmt = conn
        .prepare(&format!("PRAGMA table_info({table_name})"))
        .map_err(|e| format!("Falha ao inspecionar colunas: {e}"))?;

    let rows = stmt
        .query_map([], |row| row.get::<_, String>(1))
        .map_err(|e| format!("Falha ao ler colunas da tabela {table_name}: {e}"))?;

    for row in rows {
        let col = row.map_err(|e| format!("Falha ao iterar colunas: {e}"))?;
        if col == column_name {
            return Ok(true);
        }
    }

    Ok(false)
}

fn ensure_configuracao_columns(conn: &Connection) -> Result<(), String> {
    if !has_column(conn, "configuracao_loja", "nome_loja")? {
        conn.execute(
            "ALTER TABLE configuracao_loja ADD COLUMN nome_loja TEXT NOT NULL DEFAULT 'NEXLOJA'",
            [],
        )
        .map_err(|e| format!("Falha ao adicionar coluna nome_loja: {e}"))?;

        if has_column(conn, "configuracao_loja", "nome_fantasia")? {
            conn.execute(
                "UPDATE configuracao_loja SET nome_loja = nome_fantasia WHERE nome_loja IS NULL OR TRIM(nome_loja) = ''",
                [],
            )
            .map_err(|e| format!("Falha ao migrar nome_fantasia para nome_loja: {e}"))?;
        }
    }

    if !has_column(conn, "configuracao_loja", "email")? {
        conn.execute("ALTER TABLE configuracao_loja ADD COLUMN email TEXT", [])
            .map_err(|e| format!("Falha ao adicionar coluna email: {e}"))?;
    }

    if !has_column(conn, "configuracao_loja", "logo_path")? {
        conn.execute("ALTER TABLE configuracao_loja ADD COLUMN logo_path TEXT", [])
            .map_err(|e| format!("Falha ao adicionar coluna logo_path: {e}"))?;
    }

    if !has_column(conn, "configuracao_loja", "tema")? {
        conn.execute(
            "ALTER TABLE configuracao_loja ADD COLUMN tema TEXT NOT NULL DEFAULT 'light'",
            [],
        )
        .map_err(|e| format!("Falha ao adicionar coluna tema: {e}"))?;
    }

    if !has_column(conn, "configuracao_loja", "moeda")? {
        conn.execute(
            "ALTER TABLE configuracao_loja ADD COLUMN moeda TEXT NOT NULL DEFAULT 'BRL'",
            [],
        )
        .map_err(|e| format!("Falha ao adicionar coluna moeda: {e}"))?;
    }

    Ok(())
}

fn ensure_produtos_columns(conn: &Connection) -> Result<(), String> {
    if !has_column(conn, "produtos", "codigo_barras")? {
        conn.execute("ALTER TABLE produtos ADD COLUMN codigo_barras TEXT", [])
            .map_err(|e| format!("Falha ao adicionar coluna codigo_barras: {e}"))?;
    }

    if !has_column(conn, "produtos", "marca")? {
        conn.execute("ALTER TABLE produtos ADD COLUMN marca TEXT", [])
            .map_err(|e| format!("Falha ao adicionar coluna marca: {e}"))?;
    }

    if !has_column(conn, "produtos", "preco_custo")? {
        conn.execute(
            "ALTER TABLE produtos ADD COLUMN preco_custo REAL NOT NULL DEFAULT 0",
            [],
        )
        .map_err(|e| format!("Falha ao adicionar coluna preco_custo: {e}"))?;

        if has_column(conn, "produtos", "custo")? {
            conn.execute("UPDATE produtos SET preco_custo = custo", [])
                .map_err(|e| format!("Falha ao migrar custo para preco_custo: {e}"))?;
        }
    }

    if !has_column(conn, "produtos", "unidade")? {
        conn.execute(
            "ALTER TABLE produtos ADD COLUMN unidade TEXT NOT NULL DEFAULT 'UN'",
            [],
        )
        .map_err(|e| format!("Falha ao adicionar coluna unidade: {e}"))?;
    }

    if !has_column(conn, "produtos", "imagem_path")? {
        conn.execute("ALTER TABLE produtos ADD COLUMN imagem_path TEXT", [])
            .map_err(|e| format!("Falha ao adicionar coluna imagem_path: {e}"))?;
    }

    if has_column(conn, "produtos", "categoria_id")? {
        conn.execute(
            "UPDATE produtos SET categoria_id = (SELECT id FROM categorias LIMIT 1) WHERE categoria_id IS NULL",
            [],
        )
        .map_err(|e| format!("Falha ao ajustar categoria_id antigo: {e}"))?;
    }

    Ok(())
}

fn ensure_clientes_columns(conn: &Connection) -> Result<(), String> {
    if !has_column(conn, "clientes", "cpf")? {
        conn.execute("ALTER TABLE clientes ADD COLUMN cpf TEXT", [])
            .map_err(|e| format!("Falha ao adicionar coluna cpf: {e}"))?;

        if has_column(conn, "clientes", "documento")? {
            conn.execute("UPDATE clientes SET cpf = documento WHERE cpf IS NULL", [])
                .map_err(|e| format!("Falha ao migrar documento para cpf: {e}"))?;
        }
    }

    if !has_column(conn, "clientes", "observacoes")? {
        conn.execute("ALTER TABLE clientes ADD COLUMN observacoes TEXT", [])
            .map_err(|e| format!("Falha ao adicionar coluna observacoes: {e}"))?;
    }

    Ok(())
}

fn ensure_vendas_columns(conn: &Connection) -> Result<(), String> {
    if !has_column(conn, "vendas", "numero_venda")? {
        conn.execute("ALTER TABLE vendas ADD COLUMN numero_venda TEXT", [])
            .map_err(|e| format!("Falha ao adicionar coluna numero_venda: {e}"))?;
    }

    let mut stmt = conn
        .prepare("SELECT id FROM vendas WHERE numero_venda IS NULL OR TRIM(numero_venda) = ''")
        .map_err(|e| format!("Falha ao preparar migracao de numero_venda: {e}"))?;

    let rows = stmt
        .query_map([], |row| row.get::<_, i64>(0))
        .map_err(|e| format!("Falha ao executar migracao de numero_venda: {e}"))?;

    for row in rows {
        let id = row.map_err(|e| format!("Falha ao iterar migracao de numero_venda: {e}"))?;
        let numero_venda = format!("VENDA-{id:06}");
        conn.execute(
            "UPDATE vendas SET numero_venda = ?1 WHERE id = ?2",
            params![numero_venda, id],
        )
        .map_err(|e| format!("Falha ao atualizar numero_venda legado: {e}"))?;
    }

    Ok(())
}

fn ensure_seed(conn: &Connection) -> Result<(), String> {
    let usuarios_count: i64 = conn
        .query_row("SELECT COUNT(1) FROM usuarios", [], |row| row.get(0))
        .map_err(|e| format!("Falha ao consultar usuarios: {e}"))?;

    if usuarios_count == 0 {
        let admin_hash = hash_password("admin123")?;
        conn.execute(
            "INSERT INTO usuarios (login, nome, senha_hash, perfil, ativo) VALUES (?1, ?2, ?3, 'ADMIN', 1)",
            params!["admin", "Administrador", admin_hash],
        )
        .map_err(|e| format!("Falha ao inserir admin: {e}"))?;
    }

    let config_count: i64 = conn
        .query_row("SELECT COUNT(1) FROM configuracao_loja", [], |row| row.get(0))
        .map_err(|e| format!("Falha ao consultar configuracao: {e}"))?;

    if config_count == 0 {
        conn.execute(
            "INSERT INTO configuracao_loja (nome_loja, nome_fantasia, razao_social, telefone, tema, moeda) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params!["NEXLOJA", "NEXLOJA", "NEXLOJA LTDA", "(00) 0000-0000", "light", "BRL"],
        )
        .map_err(|e| format!("Falha ao inserir configuracao inicial: {e}"))?;
    }

    let categorias = ["Alimentos", "Bebidas", "Limpeza", "Higiene", "Utilidades"];
    for categoria in categorias {
        conn.execute(
            "INSERT OR IGNORE INTO categorias (nome, ativo) VALUES (?1, 1)",
            params![categoria],
        )
        .map_err(|e| format!("Falha ao inserir categorias iniciais: {e}"))?;
    }

    Ok(())
}

fn normalize_optional_text(value: &Option<String>) -> Option<String> {
    value
        .as_ref()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

fn validate_produto_payload(payload: &UpsertProdutoPayload) -> Result<(), String> {
    if payload.codigo.trim().is_empty() {
        return Err("Codigo e obrigatorio".to_string());
    }

    if payload.nome.trim().is_empty() {
        return Err("Nome e obrigatorio".to_string());
    }

    if payload.preco_venda < 0.0 {
        return Err("Preco de venda nao pode ser negativo".to_string());
    }

    if payload.preco_custo.unwrap_or(0.0) < 0.0 {
        return Err("Preco de custo nao pode ser negativo".to_string());
    }

    if payload.estoque_atual < 0.0 {
        return Err("Estoque atual nao pode ser negativo".to_string());
    }

    if payload.estoque_minimo < 0.0 {
        return Err("Estoque minimo nao pode ser negativo".to_string());
    }

    Ok(())
}

fn validate_cliente_payload(payload: &UpsertClientePayload) -> Result<(), String> {
    if payload.nome.trim().is_empty() {
        return Err("Nome e obrigatorio".to_string());
    }

    Ok(())
}

fn validate_movimentacao_payload(payload: &RegistrarMovimentacaoPayload) -> Result<(), String> {
    if payload.quantidade <= 0.0 {
        return Err("Quantidade deve ser maior que zero".to_string());
    }

    if payload.motivo.trim().is_empty() {
        return Err("Motivo e obrigatorio".to_string());
    }

    match payload.tipo.as_str() {
        "ENTRADA" | "SAIDA" | "AJUSTE" => Ok(()),
        _ => Err("Tipo de movimentacao invalido".to_string()),
    }
}

fn validate_finalizar_venda_payload(payload: &FinalizarVendaPayload) -> Result<(), String> {
    if payload.itens.is_empty() {
        return Err("Nao e permitido finalizar venda sem itens".to_string());
    }

    if payload.desconto < 0.0 {
        return Err("Desconto nao pode ser negativo".to_string());
    }

    match payload.forma_pagamento.as_str() {
        "DINHEIRO" | "PIX" | "CARTAO_DEBITO" | "CARTAO_CREDITO" => {}
        _ => return Err("Forma de pagamento invalida".to_string()),
    }

    for item in &payload.itens {
        if item.quantidade <= 0.0 {
            return Err("Quantidade dos itens deve ser maior que zero".to_string());
        }
    }

    Ok(())
}

fn get_caixa_sessao_aberta(
    conn: &Connection,
    usuario_id: i64,
) -> Result<Option<(i64, String, f64, Option<String>)>, String> {
    let mut stmt = conn
        .prepare(
            "
            SELECT id, aberto_em, valor_abertura, observacao
            FROM caixa_sessoes
            WHERE usuario_abertura_id = ?1 AND status = 'ABERTO'
            ORDER BY aberto_em DESC
            LIMIT 1
            ",
        )
        .map_err(|e| format!("Falha ao consultar sessao aberta de caixa: {e}"))?;

    let mut rows = stmt
        .query(params![usuario_id])
        .map_err(|e| format!("Falha ao executar consulta de sessao aberta: {e}"))?;

    if let Some(row) = rows
        .next()
        .map_err(|e| format!("Falha ao iterar consulta de sessao aberta: {e}"))?
    {
        Ok(Some((
            row.get(0).map_err(|e| format!("Falha ao ler id sessao: {e}"))?,
            row.get(1)
                .map_err(|e| format!("Falha ao ler data abertura: {e}"))?,
            row.get(2)
                .map_err(|e| format!("Falha ao ler valor abertura: {e}"))?,
            row.get(3)
                .map_err(|e| format!("Falha ao ler observacao abertura: {e}"))?,
        )))
    } else {
        Ok(None)
    }
}

fn generate_sale_number() -> String {
    format!("V-{}", Uuid::new_v4().simple())
}

fn categoria_exists(conn: &Connection, categoria_id: i64) -> Result<bool, String> {
    let total: i64 = conn
        .query_row(
            "SELECT COUNT(1) FROM categorias WHERE id = ?1",
            params![categoria_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Falha ao validar categoria: {e}"))?;

    Ok(total > 0)
}

fn codigo_exists(conn: &Connection, codigo: &str, ignore_id: Option<i64>) -> Result<bool, String> {
    if let Some(id) = ignore_id {
        let total: i64 = conn
            .query_row(
                "SELECT COUNT(1) FROM produtos WHERE codigo = ?1 AND id <> ?2",
                params![codigo, id],
                |row| row.get(0),
            )
            .map_err(|e| format!("Falha ao validar codigo unico: {e}"))?;

        return Ok(total > 0);
    }

    let total: i64 = conn
        .query_row(
            "SELECT COUNT(1) FROM produtos WHERE codigo = ?1",
            params![codigo],
            |row| row.get(0),
        )
        .map_err(|e| format!("Falha ao validar codigo unico: {e}"))?;

    Ok(total > 0)
}

#[tauri::command]
fn initialize_database(app: AppHandle) -> Result<(), String> {
    let conn = open_connection(&app)?;
    ensure_schema(&conn)?;
    ensure_seed(&conn)?;
    Ok(())
}

#[tauri::command]
fn login(app: AppHandle, login: String, senha: String) -> Result<LoginResponse, String> {
    let conn = open_connection(&app)?;

    let mut stmt = conn
        .prepare(
            "SELECT id, login, nome, senha_hash, perfil, ativo FROM usuarios WHERE login = ?1 LIMIT 1",
        )
        .map_err(|e| format!("Falha ao preparar consulta de login: {e}"))?;

    let user_row = stmt
        .query_row(params![login], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, i64>(5)?,
            ))
        })
        .map_err(|_| "Usuario ou senha invalidos".to_string())?;

    if user_row.5 != 1 {
        return Err("Usuario inativo".to_string());
    }

    let password_ok = verify_password(&user_row.3, &senha)?;
    if !password_ok {
        return Err("Usuario ou senha invalidos".to_string());
    }

    Ok(LoginResponse {
        token: Uuid::new_v4().to_string(),
        usuario: UsuarioSessao {
            id: user_row.0,
            login: user_row.1,
            nome: user_row.2,
            perfil: user_row.4,
        },
    })
}

#[tauri::command]
fn list_categories(app: AppHandle) -> Result<Vec<CategoriaListItem>, String> {
    let conn = open_connection(&app)?;

    let mut stmt = conn
        .prepare("SELECT id, nome FROM categorias WHERE ativo = 1 ORDER BY nome")
        .map_err(|e| format!("Falha ao listar categorias: {e}"))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(CategoriaListItem {
                id: row.get(0)?,
                nome: row.get(1)?,
            })
        })
        .map_err(|e| format!("Falha ao mapear categorias: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Falha ao iterar categorias: {e}"))?);
    }

    Ok(result)
}

#[tauri::command]
fn list_products(app: AppHandle, filters: Option<ProdutoListFilters>) -> Result<Vec<ProdutoListItem>, String> {
    let conn = open_connection(&app)?;
    let mut conditions: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(f) = filters {
        if let Some(query) = f.query {
            let query_like = format!("%{}%", query.trim().to_lowercase());
            if !query.trim().is_empty() {
                conditions.push("(LOWER(p.nome) LIKE ? OR LOWER(p.codigo) LIKE ? OR LOWER(COALESCE(p.codigo_barras, '')) LIKE ?)".to_string());
                values.push(Value::from(query_like.clone()));
                values.push(Value::from(query_like.clone()));
                values.push(Value::from(query_like));
            }
        }

        if let Some(categoria_id) = f.categoria_id {
            conditions.push("p.categoria_id = ?".to_string());
            values.push(Value::from(categoria_id));
        }

        if let Some(ativo) = f.ativo {
            conditions.push("p.ativo = ?".to_string());
            values.push(Value::from(if ativo { 1 } else { 0 }));
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "
        SELECT p.id, p.codigo, p.nome, p.codigo_barras, p.categoria_id, c.nome AS categoria_nome,
               p.preco_venda, p.estoque_atual, p.ativo
        FROM produtos p
        INNER JOIN categorias c ON c.id = p.categoria_id
        {}
        ORDER BY p.nome
        ",
        where_clause
    );

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("Falha ao preparar listagem de produtos: {e}"))?;

    let rows = stmt
        .query_map(params_from_iter(values), |row| {
            Ok(ProdutoListItem {
                id: row.get(0)?,
                codigo: row.get(1)?,
                nome: row.get(2)?,
                codigo_barras: row.get(3)?,
                categoria_id: row.get(4)?,
                categoria_nome: row.get(5)?,
                preco_venda: row.get(6)?,
                estoque_atual: row.get(7)?,
                ativo: row.get::<_, i64>(8)? == 1,
            })
        })
        .map_err(|e| format!("Falha ao executar listagem de produtos: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Falha ao iterar produtos: {e}"))?);
    }

    Ok(result)
}

#[tauri::command]
fn get_product_by_id(app: AppHandle, id: i64) -> Result<ProdutoDetalhe, String> {
    let conn = open_connection(&app)?;

    conn.query_row(
        "
        SELECT p.id, p.codigo, p.nome, p.categoria_id, c.nome AS categoria_nome,
               p.preco_venda, p.estoque_atual, p.estoque_minimo, p.ativo,
               p.codigo_barras, p.descricao, p.marca, COALESCE(p.preco_custo, 0),
               COALESCE(p.unidade, 'UN'), p.imagem_path
        FROM produtos p
        INNER JOIN categorias c ON c.id = p.categoria_id
        WHERE p.id = ?1
        LIMIT 1
        ",
        params![id],
        |row| {
            Ok(ProdutoDetalhe {
                id: row.get(0)?,
                codigo: row.get(1)?,
                nome: row.get(2)?,
                categoria_id: row.get(3)?,
                categoria_nome: row.get(4)?,
                preco_venda: row.get(5)?,
                estoque_atual: row.get(6)?,
                estoque_minimo: row.get(7)?,
                ativo: row.get::<_, i64>(8)? == 1,
                codigo_barras: row.get(9)?,
                descricao: row.get(10)?,
                marca: row.get(11)?,
                preco_custo: row.get(12)?,
                unidade: row.get(13)?,
                imagem_path: row.get(14)?,
            })
        },
    )
    .map_err(|_| "Produto nao encontrado".to_string())
}

#[tauri::command]
fn create_product(app: AppHandle, payload: UpsertProdutoPayload) -> Result<i64, String> {
    let conn = open_connection(&app)?;
    validate_produto_payload(&payload)?;

    let codigo = payload.codigo.trim().to_string();
    let nome = payload.nome.trim().to_string();

    if codigo_exists(&conn, &codigo, None)? {
        return Err("Ja existe um produto com este codigo".to_string());
    }

    if !categoria_exists(&conn, payload.categoria_id)? {
        return Err("Categoria informada nao existe".to_string());
    }

    let preco_custo = payload.preco_custo.unwrap_or(0.0);
    let unidade = payload
        .unidade
        .as_ref()
        .map(|u| u.trim().to_string())
        .filter(|u| !u.is_empty())
        .unwrap_or_else(|| "UN".to_string());

    conn.execute(
        "
        INSERT INTO produtos (
            codigo, codigo_barras, nome, descricao, marca, categoria_id,
            preco_venda, preco_custo, unidade, imagem_path,
            estoque_atual, estoque_minimo, ativo, criado_em, atualizado_em
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ",
        params![
            codigo,
            normalize_optional_text(&payload.codigo_barras),
            nome,
            normalize_optional_text(&payload.descricao),
            normalize_optional_text(&payload.marca),
            payload.categoria_id,
            payload.preco_venda,
            preco_custo,
            unidade,
            normalize_optional_text(&payload.imagem_path),
            payload.estoque_atual,
            payload.estoque_minimo,
            if payload.ativo { 1 } else { 0 }
        ],
    )
    .map_err(|e| format!("Falha ao criar produto: {e}"))?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn update_product(app: AppHandle, id: i64, payload: UpsertProdutoPayload) -> Result<(), String> {
    let conn = open_connection(&app)?;
    validate_produto_payload(&payload)?;

    let codigo = payload.codigo.trim().to_string();
    let nome = payload.nome.trim().to_string();

    if codigo_exists(&conn, &codigo, Some(id))? {
        return Err("Ja existe um produto com este codigo".to_string());
    }

    if !categoria_exists(&conn, payload.categoria_id)? {
        return Err("Categoria informada nao existe".to_string());
    }

    let updated = conn
        .execute(
            "
            UPDATE produtos
            SET codigo = ?1,
                codigo_barras = ?2,
                nome = ?3,
                descricao = ?4,
                marca = ?5,
                categoria_id = ?6,
                preco_venda = ?7,
                preco_custo = ?8,
                unidade = ?9,
                imagem_path = ?10,
                estoque_atual = ?11,
                estoque_minimo = ?12,
                ativo = ?13,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?14
            ",
            params![
                codigo,
                normalize_optional_text(&payload.codigo_barras),
                nome,
                normalize_optional_text(&payload.descricao),
                normalize_optional_text(&payload.marca),
                payload.categoria_id,
                payload.preco_venda,
                payload.preco_custo.unwrap_or(0.0),
                payload
                    .unidade
                    .as_ref()
                    .map(|u| u.trim().to_string())
                    .filter(|u| !u.is_empty())
                    .unwrap_or_else(|| "UN".to_string()),
                normalize_optional_text(&payload.imagem_path),
                payload.estoque_atual,
                payload.estoque_minimo,
                if payload.ativo { 1 } else { 0 },
                id
            ],
        )
        .map_err(|e| format!("Falha ao atualizar produto: {e}"))?;

    if updated == 0 {
        return Err("Produto nao encontrado".to_string());
    }

    Ok(())
}

#[tauri::command]
fn deactivate_product(app: AppHandle, id: i64) -> Result<(), String> {
    let conn = open_connection(&app)?;

    let updated = conn
        .execute(
            "UPDATE produtos SET ativo = 0, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?1",
            params![id],
        )
        .map_err(|e| format!("Falha ao inativar produto: {e}"))?;

    if updated == 0 {
        return Err("Produto nao encontrado".to_string());
    }

    Ok(())
}

#[tauri::command]
fn list_clients(app: AppHandle, filters: Option<ClienteListFilters>) -> Result<Vec<ClienteListItem>, String> {
    let conn = open_connection(&app)?;
    let mut conditions: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(f) = filters {
        if let Some(query) = f.query {
            let query_like = format!("%{}%", query.trim().to_lowercase());
            if !query.trim().is_empty() {
                conditions.push(
                    "(LOWER(c.nome) LIKE ? OR LOWER(COALESCE(c.cpf, '')) LIKE ? OR LOWER(COALESCE(c.telefone, '')) LIKE ?)"
                        .to_string(),
                );
                values.push(Value::from(query_like.clone()));
                values.push(Value::from(query_like.clone()));
                values.push(Value::from(query_like));
            }
        }

        if let Some(ativo) = f.ativo {
            conditions.push("c.ativo = ?".to_string());
            values.push(Value::from(if ativo { 1 } else { 0 }));
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "
        SELECT c.id, c.nome, c.cpf, c.telefone, c.email, c.ativo
        FROM clientes c
        {}
        ORDER BY c.nome
        ",
        where_clause
    );

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("Falha ao preparar listagem de clientes: {e}"))?;

    let rows = stmt
        .query_map(params_from_iter(values), |row| {
            Ok(ClienteListItem {
                id: row.get(0)?,
                nome: row.get(1)?,
                cpf: row.get(2)?,
                telefone: row.get(3)?,
                email: row.get(4)?,
                ativo: row.get::<_, i64>(5)? == 1,
            })
        })
        .map_err(|e| format!("Falha ao executar listagem de clientes: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Falha ao iterar clientes: {e}"))?);
    }

    Ok(result)
}

#[tauri::command]
fn get_client_by_id(app: AppHandle, id: i64) -> Result<ClienteDetalhe, String> {
    let conn = open_connection(&app)?;

    let mut detalhe: ClienteDetalhe = conn
        .query_row(
            "
            SELECT id, nome, cpf, telefone, email, endereco, observacoes, ativo
            FROM clientes
            WHERE id = ?1
            LIMIT 1
            ",
            params![id],
            |row| {
                Ok(ClienteDetalhe {
                    id: row.get(0)?,
                    nome: row.get(1)?,
                    cpf: row.get(2)?,
                    telefone: row.get(3)?,
                    email: row.get(4)?,
                    endereco: row.get(5)?,
                    observacoes: row.get(6)?,
                    ativo: row.get::<_, i64>(7)? == 1,
                    resumo_compras: ClienteResumoCompras {
                        quantidade_vendas: 0,
                        total_gasto: 0.0,
                        ultima_compra_em: None,
                    },
                })
            },
        )
        .map_err(|_| "Cliente nao encontrado".to_string())?;

    let resumo = conn
        .query_row(
            "
            SELECT COUNT(1), COALESCE(SUM(total), 0), MAX(criado_em)
            FROM vendas
            WHERE cliente_id = ?1 AND status = 'FINALIZADA'
            ",
            params![id],
            |row| {
                Ok(ClienteResumoCompras {
                    quantidade_vendas: row.get(0)?,
                    total_gasto: row.get(1)?,
                    ultima_compra_em: row.get(2)?,
                })
            },
        )
        .map_err(|e| format!("Falha ao carregar resumo de compras: {e}"))?;

    detalhe.resumo_compras = resumo;
    Ok(detalhe)
}

#[tauri::command]
fn create_client(app: AppHandle, payload: UpsertClientePayload) -> Result<i64, String> {
    let conn = open_connection(&app)?;
    validate_cliente_payload(&payload)?;

    conn.execute(
        "
        INSERT INTO clientes (
            nome, cpf, telefone, email, endereco, observacoes, ativo, criado_em, atualizado_em
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ",
        params![
            payload.nome.trim().to_string(),
            normalize_optional_text(&payload.cpf),
            normalize_optional_text(&payload.telefone),
            normalize_optional_text(&payload.email),
            normalize_optional_text(&payload.endereco),
            normalize_optional_text(&payload.observacoes),
            if payload.ativo { 1 } else { 0 }
        ],
    )
    .map_err(|e| format!("Falha ao criar cliente: {e}"))?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn update_client(app: AppHandle, id: i64, payload: UpsertClientePayload) -> Result<(), String> {
    let conn = open_connection(&app)?;
    validate_cliente_payload(&payload)?;

    let updated = conn
        .execute(
            "
            UPDATE clientes
            SET nome = ?1,
                cpf = ?2,
                telefone = ?3,
                email = ?4,
                endereco = ?5,
                observacoes = ?6,
                ativo = ?7,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?8
            ",
            params![
                payload.nome.trim().to_string(),
                normalize_optional_text(&payload.cpf),
                normalize_optional_text(&payload.telefone),
                normalize_optional_text(&payload.email),
                normalize_optional_text(&payload.endereco),
                normalize_optional_text(&payload.observacoes),
                if payload.ativo { 1 } else { 0 },
                id
            ],
        )
        .map_err(|e| format!("Falha ao atualizar cliente: {e}"))?;

    if updated == 0 {
        return Err("Cliente nao encontrado".to_string());
    }

    Ok(())
}

#[tauri::command]
fn deactivate_client(app: AppHandle, id: i64) -> Result<(), String> {
    let conn = open_connection(&app)?;

    let updated = conn
        .execute(
            "UPDATE clientes SET ativo = 0, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?1",
            params![id],
        )
        .map_err(|e| format!("Falha ao inativar cliente: {e}"))?;

    if updated == 0 {
        return Err("Cliente nao encontrado".to_string());
    }

    Ok(())
}

#[tauri::command]
fn list_stock(app: AppHandle, filters: Option<EstoqueFilters>) -> Result<Vec<EstoqueItem>, String> {
    let conn = open_connection(&app)?;
    let mut conditions: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(f) = filters {
        if let Some(query) = f.query {
            let query_like = format!("%{}%", query.trim().to_lowercase());
            if !query.trim().is_empty() {
                conditions.push("(LOWER(p.nome) LIKE ? OR LOWER(p.codigo) LIKE ?)".to_string());
                values.push(Value::from(query_like.clone()));
                values.push(Value::from(query_like));
            }
        }

        if let Some(categoria_id) = f.categoria_id {
            conditions.push("p.categoria_id = ?".to_string());
            values.push(Value::from(categoria_id));
        }

        if f.apenas_estoque_baixo.unwrap_or(false) {
            conditions.push("p.estoque_atual <= p.estoque_minimo".to_string());
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "
        SELECT p.id, p.codigo, p.nome, p.categoria_id, c.nome, p.estoque_atual, p.estoque_minimo, p.ativo
        FROM produtos p
        INNER JOIN categorias c ON c.id = p.categoria_id
        {}
        ORDER BY p.ativo DESC, p.nome
        ",
        where_clause
    );

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("Falha ao preparar listagem de estoque: {e}"))?;

    let rows = stmt
        .query_map(params_from_iter(values), |row| {
            let estoque_atual: f64 = row.get(5)?;
            let estoque_minimo: f64 = row.get(6)?;
            let status = if estoque_atual <= 0.0 {
                "ZERADO"
            } else if estoque_atual <= estoque_minimo {
                "BAIXO"
            } else {
                "NORMAL"
            };

            Ok(EstoqueItem {
                produto_id: row.get(0)?,
                codigo: row.get(1)?,
                nome: row.get(2)?,
                categoria_id: row.get(3)?,
                categoria_nome: row.get(4)?,
                estoque_atual,
                estoque_minimo,
                status_estoque: status.to_string(),
                ativo: row.get::<_, i64>(7)? == 1,
            })
        })
        .map_err(|e| format!("Falha ao executar listagem de estoque: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Falha ao iterar estoque: {e}"))?);
    }

    Ok(result)
}

#[tauri::command]
fn list_stock_products(app: AppHandle) -> Result<Vec<ProdutoMovimentacaoOption>, String> {
    let conn = open_connection(&app)?;

    let mut stmt = conn
        .prepare("SELECT id, codigo, nome, ativo FROM produtos ORDER BY ativo DESC, nome")
        .map_err(|e| format!("Falha ao listar produtos para movimentacao: {e}"))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(ProdutoMovimentacaoOption {
                id: row.get(0)?,
                codigo: row.get(1)?,
                nome: row.get(2)?,
                ativo: row.get::<_, i64>(3)? == 1,
            })
        })
        .map_err(|e| format!("Falha ao mapear produtos para movimentacao: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Falha ao iterar produtos para movimentacao: {e}"))?);
    }

    Ok(result)
}

#[tauri::command]
fn list_stock_movements(
    app: AppHandle,
    filters: Option<MovimentacaoFilters>,
) -> Result<Vec<MovimentacaoEstoqueItem>, String> {
    let conn = open_connection(&app)?;
    let mut conditions: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(f) = filters {
        if let Some(produto_id) = f.produto_id {
            conditions.push("m.produto_id = ?".to_string());
            values.push(Value::from(produto_id));
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "
        SELECT m.id, m.produto_id, p.nome, p.codigo, m.tipo, m.quantidade,
               m.estoque_antes, m.estoque_depois, m.origem, m.observacao, m.usuario_id, m.criado_em
        FROM movimentacoes_estoque m
        INNER JOIN produtos p ON p.id = m.produto_id
        {}
        ORDER BY m.criado_em DESC
        LIMIT 200
        ",
        where_clause
    );

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("Falha ao preparar historico de movimentacoes: {e}"))?;

    let rows = stmt
        .query_map(params_from_iter(values), |row| {
            Ok(MovimentacaoEstoqueItem {
                id: row.get(0)?,
                produto_id: row.get(1)?,
                produto_nome: row.get(2)?,
                produto_codigo: row.get(3)?,
                tipo: row.get(4)?,
                quantidade: row.get(5)?,
                estoque_antes: row.get(6)?,
                estoque_depois: row.get(7)?,
                motivo: row.get(8)?,
                observacao: row.get(9)?,
                usuario_id: row.get(10)?,
                criado_em: row.get(11)?,
            })
        })
        .map_err(|e| format!("Falha ao executar historico de movimentacoes: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Falha ao iterar historico de movimentacoes: {e}"))?);
    }

    Ok(result)
}

#[tauri::command]
fn register_stock_movement(app: AppHandle, payload: RegistrarMovimentacaoPayload) -> Result<(), String> {
    let mut conn = open_connection(&app)?;
    validate_movimentacao_payload(&payload)?;

    let tx = conn
        .transaction()
        .map_err(|e| format!("Falha ao iniciar transacao: {e}"))?;

    let produto_data: (f64, i64) = tx
        .query_row(
            "SELECT estoque_atual, ativo FROM produtos WHERE id = ?1 LIMIT 1",
            params![payload.produto_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|_| "Produto nao encontrado".to_string())?;

    let estoque_antes = produto_data.0;
    let mut estoque_depois = estoque_antes;

    match payload.tipo.as_str() {
        "ENTRADA" => {
            estoque_depois = estoque_antes + payload.quantidade;
        }
        "SAIDA" => {
            if payload.quantidade > estoque_antes {
                return Err("Saida nao pode deixar estoque negativo".to_string());
            }
            estoque_depois = estoque_antes - payload.quantidade;
        }
        "AJUSTE" => {
            estoque_depois = payload.quantidade;
        }
        _ => {}
    }

    if estoque_depois < 0.0 {
        return Err("Estoque final invalido".to_string());
    }

    tx.execute(
        "UPDATE produtos SET estoque_atual = ?1, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?2",
        params![estoque_depois, payload.produto_id],
    )
    .map_err(|e| format!("Falha ao atualizar estoque do produto: {e}"))?;

    tx.execute(
        "
        INSERT INTO movimentacoes_estoque (
            produto_id, usuario_id, tipo, quantidade, estoque_antes, estoque_depois,
            origem, referencia_id, observacao, criado_em
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, NULL, ?8, CURRENT_TIMESTAMP)
        ",
        params![
            payload.produto_id,
            payload.usuario_id,
            payload.tipo,
            payload.quantidade,
            estoque_antes,
            estoque_depois,
            payload.motivo.trim().to_string(),
            normalize_optional_text(&payload.observacao)
        ],
    )
    .map_err(|e| format!("Falha ao registrar movimentacao de estoque: {e}"))?;

    tx.commit()
        .map_err(|e| format!("Falha ao concluir transacao de estoque: {e}"))?;

    Ok(())
}

#[tauri::command]
fn get_current_cash_session(app: AppHandle, usuario_id: i64) -> Result<Option<CaixaSessaoAtual>, String> {
    let conn = open_connection(&app)?;
    let sessao_aberta = get_caixa_sessao_aberta(&conn, usuario_id)?;

    let Some((sessao_id, aberto_em, valor_abertura, observacao)) = sessao_aberta else {
        return Ok(None);
    };

    let resumo: (i64, f64) = conn
        .query_row(
            "SELECT COUNT(1), COALESCE(SUM(valor), 0) FROM caixa_movimentos WHERE caixa_sessao_id = ?1",
            params![sessao_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| format!("Falha ao calcular resumo da sessao de caixa: {e}"))?;

    Ok(Some(CaixaSessaoAtual {
        id: sessao_id,
        usuario_id,
        aberto_em,
        fechado_em: None,
        valor_abertura,
        valor_fechamento: None,
        valor_sistema: None,
        diferenca: None,
        status: "ABERTO".to_string(),
        observacao,
        total_movimentos: resumo.0,
        valor_final_calculado: resumo.1,
    }))
}

#[tauri::command]
fn open_cash_session(app: AppHandle, payload: AbrirCaixaPayload) -> Result<CaixaSessaoAtual, String> {
    if payload.valor_inicial < 0.0 {
        return Err("Valor inicial nao pode ser negativo".to_string());
    }

    let mut conn = open_connection(&app)?;
    let sessao_aberta = get_caixa_sessao_aberta(&conn, payload.usuario_id)?;
    if sessao_aberta.is_some() {
        return Err("Usuario ja possui uma sessao de caixa aberta".to_string());
    }

    let tx = conn
        .transaction()
        .map_err(|e| format!("Falha ao iniciar transacao de abertura de caixa: {e}"))?;

    tx.execute(
        "
        INSERT INTO caixa_sessoes (
            usuario_abertura_id, aberto_em, valor_abertura, status, observacao
        ) VALUES (?1, CURRENT_TIMESTAMP, ?2, 'ABERTO', ?3)
        ",
        params![
            payload.usuario_id,
            payload.valor_inicial,
            normalize_optional_text(&payload.observacoes)
        ],
    )
    .map_err(|e| format!("Falha ao abrir sessao de caixa: {e}"))?;

    let sessao_id = tx.last_insert_rowid();

    tx.execute(
        "
        INSERT INTO caixa_movimentos (
            caixa_sessao_id, usuario_id, tipo, valor, observacao, criado_em
        ) VALUES (?1, ?2, 'ABERTURA', ?3, ?4, CURRENT_TIMESTAMP)
        ",
        params![
            sessao_id,
            payload.usuario_id,
            payload.valor_inicial,
            normalize_optional_text(&payload.observacoes)
        ],
    )
    .map_err(|e| format!("Falha ao registrar movimento de abertura: {e}"))?;

    let aberto_em: String = tx
        .query_row(
            "SELECT aberto_em FROM caixa_sessoes WHERE id = ?1",
            params![sessao_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Falha ao consultar data de abertura de caixa: {e}"))?;

    tx.commit()
        .map_err(|e| format!("Falha ao concluir abertura de caixa: {e}"))?;

    Ok(CaixaSessaoAtual {
        id: sessao_id,
        usuario_id: payload.usuario_id,
        aberto_em,
        fechado_em: None,
        valor_abertura: payload.valor_inicial,
        valor_fechamento: None,
        valor_sistema: None,
        diferenca: None,
        status: "ABERTO".to_string(),
        observacao: normalize_optional_text(&payload.observacoes),
        total_movimentos: 1,
        valor_final_calculado: payload.valor_inicial,
    })
}

#[tauri::command]
fn list_cash_movements(app: AppHandle, caixa_sessao_id: i64) -> Result<Vec<CaixaMovimentoItem>, String> {
    let conn = open_connection(&app)?;
    let mut stmt = conn
        .prepare(
            "
            SELECT id, tipo, valor, observacao, criado_em
            FROM caixa_movimentos
            WHERE caixa_sessao_id = ?1
            ORDER BY criado_em DESC
            ",
        )
        .map_err(|e| format!("Falha ao preparar listagem de movimentos de caixa: {e}"))?;

    let rows = stmt
        .query_map(params![caixa_sessao_id], |row| {
            Ok(CaixaMovimentoItem {
                id: row.get(0)?,
                tipo: row.get(1)?,
                valor: row.get(2)?,
                observacao: row.get(3)?,
                criado_em: row.get(4)?,
            })
        })
        .map_err(|e| format!("Falha ao executar listagem de movimentos de caixa: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Falha ao iterar movimentos de caixa: {e}"))?);
    }

    Ok(result)
}

#[tauri::command]
fn close_cash_session(app: AppHandle, payload: FecharCaixaPayload) -> Result<CaixaSessaoAtual, String> {
    if payload.valor_final_informado < 0.0 {
        return Err("Valor final informado nao pode ser negativo".to_string());
    }

    let mut conn = open_connection(&app)?;
    let sessao_aberta = get_caixa_sessao_aberta(&conn, payload.usuario_id)?;
    let Some((sessao_id, aberto_em, valor_abertura, observacao_abertura)) = sessao_aberta else {
        return Err("Nao existe sessao de caixa aberta para este usuario".to_string());
    };

    let tx = conn
        .transaction()
        .map_err(|e| format!("Falha ao iniciar transacao de fechamento de caixa: {e}"))?;

    let valor_calculado: f64 = tx
        .query_row(
            "SELECT COALESCE(SUM(valor), 0) FROM caixa_movimentos WHERE caixa_sessao_id = ?1 AND tipo <> 'FECHAMENTO'",
            params![sessao_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Falha ao calcular valor final de caixa: {e}"))?;

    let diferenca = payload.valor_final_informado - valor_calculado;

    tx.execute(
        "
        UPDATE caixa_sessoes
        SET usuario_fechamento_id = ?1,
            fechado_em = CURRENT_TIMESTAMP,
            valor_fechamento = ?2,
            valor_sistema = ?3,
            status = 'FECHADO',
            observacao = ?4
        WHERE id = ?5 AND status = 'ABERTO'
        ",
        params![
            payload.usuario_id,
            payload.valor_final_informado,
            valor_calculado,
            normalize_optional_text(&payload.observacoes),
            sessao_id
        ],
    )
    .map_err(|e| format!("Falha ao fechar sessao de caixa: {e}"))?;

    tx.execute(
        "
        INSERT INTO caixa_movimentos (
            caixa_sessao_id, usuario_id, tipo, valor, observacao, criado_em
        ) VALUES (?1, ?2, 'FECHAMENTO', ?3, ?4, CURRENT_TIMESTAMP)
        ",
        params![
            sessao_id,
            payload.usuario_id,
            payload.valor_final_informado,
            normalize_optional_text(&payload.observacoes)
        ],
    )
    .map_err(|e| format!("Falha ao registrar movimento de fechamento: {e}"))?;

    let total_movimentos: i64 = tx
        .query_row(
            "SELECT COUNT(1) FROM caixa_movimentos WHERE caixa_sessao_id = ?1",
            params![sessao_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Falha ao contar movimentos de caixa: {e}"))?;

    let fechado_em: String = tx
        .query_row(
            "SELECT fechado_em FROM caixa_sessoes WHERE id = ?1",
            params![sessao_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Falha ao consultar data de fechamento de caixa: {e}"))?;

    tx.commit()
        .map_err(|e| format!("Falha ao concluir fechamento de caixa: {e}"))?;

    Ok(CaixaSessaoAtual {
        id: sessao_id,
        usuario_id: payload.usuario_id,
        aberto_em,
        fechado_em: Some(fechado_em),
        valor_abertura,
        valor_fechamento: Some(payload.valor_final_informado),
        valor_sistema: Some(valor_calculado),
        diferenca: Some(diferenca),
        status: "FECHADO".to_string(),
        observacao: normalize_optional_text(&payload.observacoes).or(observacao_abertura),
        total_movimentos,
        valor_final_calculado: valor_calculado,
    })
}

#[tauri::command]
fn search_sale_products(app: AppHandle, query: Option<String>) -> Result<Vec<ProdutoVendaBuscaItem>, String> {
    let conn = open_connection(&app)?;
    let mut conditions = vec!["p.ativo = 1".to_string()];
    let mut values: Vec<Value> = Vec::new();

    if let Some(q) = query {
        let q_like = format!("%{}%", q.trim().to_lowercase());
        if !q.trim().is_empty() {
            conditions.push(
                "(LOWER(p.nome) LIKE ? OR LOWER(p.codigo) LIKE ? OR LOWER(COALESCE(p.codigo_barras, '')) LIKE ?)"
                    .to_string(),
            );
            values.push(Value::from(q_like.clone()));
            values.push(Value::from(q_like.clone()));
            values.push(Value::from(q_like));
        }
    }

    let sql = format!(
        "
        SELECT p.id, p.codigo, p.codigo_barras, p.nome, p.preco_venda, p.estoque_atual, p.ativo
        FROM produtos p
        WHERE {}
        ORDER BY p.nome
        LIMIT 80
        ",
        conditions.join(" AND ")
    );

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("Falha ao preparar busca de produtos para venda: {e}"))?;

    let rows = stmt
        .query_map(params_from_iter(values), |row| {
            Ok(ProdutoVendaBuscaItem {
                id: row.get(0)?,
                codigo: row.get(1)?,
                codigo_barras: row.get(2)?,
                nome: row.get(3)?,
                preco_venda: row.get(4)?,
                estoque_atual: row.get(5)?,
                ativo: row.get::<_, i64>(6)? == 1,
            })
        })
        .map_err(|e| format!("Falha ao executar busca de produtos para venda: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Falha ao iterar produtos para venda: {e}"))?);
    }

    Ok(result)
}

#[tauri::command]
fn create_sale(app: AppHandle, payload: FinalizarVendaPayload) -> Result<i64, String> {
    let mut conn = open_connection(&app)?;
    validate_finalizar_venda_payload(&payload)?;

    let Some((caixa_sessao_id, _, _, _)) = get_caixa_sessao_aberta(&conn, payload.usuario_id)? else {
        return Err("Nao e permitido finalizar venda sem caixa aberto".to_string());
    };

    let tx = conn
        .transaction()
        .map_err(|e| format!("Falha ao iniciar transacao da venda: {e}"))?;

    if let Some(cliente_id) = payload.cliente_id {
        let cliente_exists: i64 = tx
            .query_row(
                "SELECT COUNT(1) FROM clientes WHERE id = ?1",
                params![cliente_id],
                |row| row.get(0),
            )
            .map_err(|e| format!("Falha ao validar cliente da venda: {e}"))?;

        if cliente_exists == 0 {
            return Err("Cliente informado nao encontrado".to_string());
        }
    }

    let mut subtotal = 0.0_f64;
    let mut itens_precificados: Vec<(i64, f64, f64)> = Vec::new();

    for item in &payload.itens {
        let (preco_venda, estoque_atual, ativo): (f64, f64, i64) = tx
            .query_row(
                "SELECT preco_venda, estoque_atual, ativo FROM produtos WHERE id = ?1 LIMIT 1",
                params![item.produto_id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .map_err(|_| "Produto informado nao encontrado".to_string())?;

        if ativo != 1 {
            return Err("Nao e permitido vender produto inativo".to_string());
        }

        if item.quantidade > estoque_atual {
            return Err("Nao e permitido vender item sem estoque suficiente".to_string());
        }

        let item_subtotal = preco_venda * item.quantidade;
        subtotal += item_subtotal;
        itens_precificados.push((item.produto_id, item.quantidade, preco_venda));
    }

    if payload.desconto > subtotal {
        return Err("Desconto nao pode ser maior que o subtotal".to_string());
    }

    let total = subtotal - payload.desconto;
    let numero_venda = generate_sale_number();

    tx.execute(
        "
        INSERT INTO vendas (
            numero_venda, caixa_sessao_id, cliente_id, usuario_id,
            subtotal, desconto, total, forma_pagamento, status, criado_em
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'FINALIZADA', CURRENT_TIMESTAMP)
        ",
        params![
            numero_venda,
            caixa_sessao_id,
            payload.cliente_id,
            payload.usuario_id,
            subtotal,
            payload.desconto,
            total,
            payload.forma_pagamento
        ],
    )
    .map_err(|e| format!("Falha ao criar venda: {e}"))?;

    let venda_id = tx.last_insert_rowid();

    for (produto_id, quantidade, preco_unitario) in itens_precificados {
        let item_subtotal = quantidade * preco_unitario;

        tx.execute(
            "
            INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
            VALUES (?1, ?2, ?3, ?4, ?5)
            ",
            params![venda_id, produto_id, quantidade, preco_unitario, item_subtotal],
        )
        .map_err(|e| format!("Falha ao inserir item de venda: {e}"))?;

        let estoque_antes: f64 = tx
            .query_row(
                "SELECT estoque_atual FROM produtos WHERE id = ?1",
                params![produto_id],
                |row| row.get(0),
            )
            .map_err(|e| format!("Falha ao consultar estoque atual do produto: {e}"))?;

        let estoque_depois = estoque_antes - quantidade;

        tx.execute(
            "UPDATE produtos SET estoque_atual = ?1, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?2",
            params![estoque_depois, produto_id],
        )
        .map_err(|e| format!("Falha ao atualizar estoque apos venda: {e}"))?;

        tx.execute(
            "
            INSERT INTO movimentacoes_estoque (
                produto_id, usuario_id, tipo, quantidade, estoque_antes, estoque_depois,
                origem, referencia_id, observacao, criado_em
            ) VALUES (?1, ?2, 'VENDA', ?3, ?4, ?5, ?6, ?7, NULL, CURRENT_TIMESTAMP)
            ",
            params![
                produto_id,
                payload.usuario_id,
                quantidade,
                estoque_antes,
                estoque_depois,
                "VENDA",
                venda_id
            ],
        )
        .map_err(|e| format!("Falha ao registrar movimentacao de estoque da venda: {e}"))?;
    }

    tx.execute(
        "
        INSERT INTO caixa_movimentos (
            caixa_sessao_id, usuario_id, tipo, valor, referencia_id, observacao, criado_em
        ) VALUES (?1, ?2, 'VENDA', ?3, ?4, ?5, CURRENT_TIMESTAMP)
        ",
        params![
            caixa_sessao_id,
            payload.usuario_id,
            total,
            venda_id,
            format!("Venda {}", venda_id)
        ],
    )
    .map_err(|e| format!("Falha ao registrar movimento de caixa da venda: {e}"))?;

    tx.commit()
        .map_err(|e| format!("Falha ao concluir transacao da venda: {e}"))?;

    Ok(venda_id)
}

#[tauri::command]
fn list_sales(app: AppHandle, filters: Option<VendaListFilters>) -> Result<Vec<VendaListItem>, String> {
    let conn = open_connection(&app)?;
    let mut conditions: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(f) = filters {
        if let Some(data_inicio) = f.data_inicio {
            if !data_inicio.trim().is_empty() {
                conditions.push("date(v.criado_em) >= date(?)".to_string());
                values.push(Value::from(data_inicio));
            }
        }

        if let Some(data_fim) = f.data_fim {
            if !data_fim.trim().is_empty() {
                conditions.push("date(v.criado_em) <= date(?)".to_string());
                values.push(Value::from(data_fim));
            }
        }

        if let Some(cliente_id) = f.cliente_id {
            conditions.push("v.cliente_id = ?".to_string());
            values.push(Value::from(cliente_id));
        }

        if let Some(status) = f.status {
            if !status.trim().is_empty() {
                conditions.push("v.status = ?".to_string());
                values.push(Value::from(status));
            }
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "
        SELECT v.id, v.numero_venda, v.criado_em, c.nome, u.nome, v.forma_pagamento, v.total, v.status
        FROM vendas v
        LEFT JOIN clientes c ON c.id = v.cliente_id
        INNER JOIN usuarios u ON u.id = v.usuario_id
        {}
        ORDER BY v.criado_em DESC
        ",
        where_clause
    );

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("Falha ao preparar listagem de vendas: {e}"))?;

    let rows = stmt
        .query_map(params_from_iter(values), |row| {
            Ok(VendaListItem {
                id: row.get(0)?,
                numero_venda: row.get(1)?,
                criado_em: row.get(2)?,
                cliente_nome: row.get(3)?,
                usuario_nome: row.get(4)?,
                forma_pagamento: row.get(5)?,
                total: row.get(6)?,
                status: row.get(7)?,
            })
        })
        .map_err(|e| format!("Falha ao executar listagem de vendas: {e}"))?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| format!("Falha ao iterar listagem de vendas: {e}"))?);
    }

    Ok(result)
}

#[tauri::command]
fn get_sale_by_id(app: AppHandle, id: i64) -> Result<VendaDetalhe, String> {
    let conn = open_connection(&app)?;

    let mut venda = conn
        .query_row(
            "
            SELECT v.id, v.numero_venda, v.criado_em, v.cliente_id, c.nome, v.usuario_id, u.nome,
                   v.caixa_sessao_id, v.forma_pagamento, v.subtotal, v.desconto, v.total, v.status,
                   v.cancelado_em, v.motivo_cancelamento
            FROM vendas v
            LEFT JOIN clientes c ON c.id = v.cliente_id
            INNER JOIN usuarios u ON u.id = v.usuario_id
            WHERE v.id = ?1
            LIMIT 1
            ",
            params![id],
            |row| {
                Ok(VendaDetalhe {
                    id: row.get(0)?,
                    numero_venda: row.get(1)?,
                    criado_em: row.get(2)?,
                    cliente_id: row.get(3)?,
                    cliente_nome: row.get(4)?,
                    usuario_id: row.get(5)?,
                    usuario_nome: row.get(6)?,
                    caixa_sessao_id: row.get(7)?,
                    forma_pagamento: row.get(8)?,
                    subtotal: row.get(9)?,
                    desconto: row.get(10)?,
                    total: row.get(11)?,
                    status: row.get(12)?,
                    cancelado_em: row.get(13)?,
                    motivo_cancelamento: row.get(14)?,
                    itens: Vec::new(),
                })
            },
        )
        .map_err(|_| "Venda nao encontrada".to_string())?;

    let mut stmt_itens = conn
        .prepare(
            "
            SELECT iv.produto_id, p.nome, p.codigo, iv.quantidade, iv.preco_unitario, iv.subtotal
            FROM itens_venda iv
            INNER JOIN produtos p ON p.id = iv.produto_id
            WHERE iv.venda_id = ?1
            ORDER BY iv.id
            ",
        )
        .map_err(|e| format!("Falha ao preparar itens da venda: {e}"))?;

    let rows = stmt_itens
        .query_map(params![id], |row| {
            Ok(VendaItemDetalhe {
                produto_id: row.get(0)?,
                produto_nome: row.get(1)?,
                produto_codigo: row.get(2)?,
                quantidade: row.get(3)?,
                preco_unitario: row.get(4)?,
                subtotal: row.get(5)?,
            })
        })
        .map_err(|e| format!("Falha ao carregar itens da venda: {e}"))?;

    let mut itens = Vec::new();
    for row in rows {
        itens.push(row.map_err(|e| format!("Falha ao iterar itens da venda: {e}"))?);
    }
    venda.itens = itens;

    Ok(venda)
}

#[tauri::command]
fn cancel_sale(app: AppHandle, payload: CancelarVendaPayload) -> Result<(), String> {
    let mut conn = open_connection(&app)?;
    let tx = conn
        .transaction()
        .map_err(|e| format!("Falha ao iniciar transacao de cancelamento da venda: {e}"))?;

    let venda_info: (String, f64, i64) = tx
        .query_row(
            "SELECT status, total, caixa_sessao_id FROM vendas WHERE id = ?1 LIMIT 1",
            params![payload.venda_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .map_err(|_| "Venda nao encontrada".to_string())?;

    if venda_info.0 == "CANCELADA" {
        return Err("Venda ja esta cancelada".to_string());
    }

    let mut stmt_itens = tx
        .prepare("SELECT produto_id, quantidade FROM itens_venda WHERE venda_id = ?1")
        .map_err(|e| format!("Falha ao preparar itens para cancelamento: {e}"))?;

    let itens_rows = stmt_itens
        .query_map(params![payload.venda_id], |row| {
            Ok((row.get::<_, i64>(0)?, row.get::<_, f64>(1)?))
        })
        .map_err(|e| format!("Falha ao carregar itens para cancelamento: {e}"))?;

    let mut itens: Vec<(i64, f64)> = Vec::new();
    for row in itens_rows {
        itens.push(row.map_err(|e| format!("Falha ao iterar itens para cancelamento: {e}"))?);
    }

    tx.execute(
        "
        UPDATE vendas
        SET status = 'CANCELADA',
            cancelado_em = CURRENT_TIMESTAMP,
            motivo_cancelamento = ?1
        WHERE id = ?2
        ",
        params![
            normalize_optional_text(&payload.motivo),
            payload.venda_id
        ],
    )
    .map_err(|e| format!("Falha ao atualizar status da venda para cancelada: {e}"))?;

    for (produto_id, quantidade) in itens {
        let estoque_antes: f64 = tx
            .query_row(
                "SELECT estoque_atual FROM produtos WHERE id = ?1",
                params![produto_id],
                |row| row.get(0),
            )
            .map_err(|e| format!("Falha ao consultar estoque para cancelamento: {e}"))?;

        let estoque_depois = estoque_antes + quantidade;

        tx.execute(
            "UPDATE produtos SET estoque_atual = ?1, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?2",
            params![estoque_depois, produto_id],
        )
        .map_err(|e| format!("Falha ao devolver estoque do item cancelado: {e}"))?;

        tx.execute(
            "
            INSERT INTO movimentacoes_estoque (
                produto_id, usuario_id, tipo, quantidade, estoque_antes, estoque_depois,
                origem, referencia_id, observacao, criado_em
            ) VALUES (?1, ?2, 'CANCELAMENTO_VENDA', ?3, ?4, ?5, ?6, ?7, ?8, CURRENT_TIMESTAMP)
            ",
            params![
                produto_id,
                payload.usuario_id,
                quantidade,
                estoque_antes,
                estoque_depois,
                "CANCELAMENTO_VENDA",
                payload.venda_id,
                normalize_optional_text(&payload.motivo)
            ],
        )
        .map_err(|e| format!("Falha ao registrar devolucao de estoque do cancelamento: {e}"))?;
    }

    tx.execute(
        "
        INSERT INTO caixa_movimentos (
            caixa_sessao_id, usuario_id, tipo, valor, referencia_id, observacao, criado_em
        ) VALUES (?1, ?2, 'ESTORNO', ?3, ?4, ?5, CURRENT_TIMESTAMP)
        ",
        params![
            venda_info.2,
            payload.usuario_id,
            -venda_info.1,
            payload.venda_id,
            normalize_optional_text(&payload.motivo)
        ],
    )
    .map_err(|e| format!("Falha ao registrar estorno de caixa no cancelamento: {e}"))?;

    tx.commit()
        .map_err(|e| format!("Falha ao concluir cancelamento da venda: {e}"))?;

    Ok(())
}

#[tauri::command]
fn get_dashboard_summary(app: AppHandle, usuario_id: i64) -> Result<DashboardResumo, String> {
    let conn = open_connection(&app)?;

    let (total_vendido_dia, quantidade_vendas_dia): (f64, i64) = conn
        .query_row(
            "
            SELECT COALESCE(SUM(total), 0), COUNT(1)
            FROM vendas
            WHERE status = 'FINALIZADA'
              AND date(criado_em, 'localtime') = date('now', 'localtime')
            ",
            [],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| format!("Falha ao calcular total vendido e quantidade de vendas do dia: {e}"))?;

    let ticket_medio_dia = if quantidade_vendas_dia > 0 {
        total_vendido_dia / quantidade_vendas_dia as f64
    } else {
        0.0
    };

    let produtos_estoque_baixo: i64 = conn
        .query_row(
            "
            SELECT COUNT(1)
            FROM produtos
            WHERE estoque_atual <= estoque_minimo
              AND estoque_atual > 0
            ",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("Falha ao calcular quantidade de produtos com estoque baixo: {e}"))?;

    let produtos_zerados: i64 = conn
        .query_row(
            "
            SELECT COUNT(1)
            FROM produtos
            WHERE estoque_atual <= 0
            ",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("Falha ao calcular quantidade de produtos zerados: {e}"))?;

    let caixa_aberto = get_caixa_sessao_aberta(&conn, usuario_id)?;
    let caixa_atual = if let Some((sessao_id, aberto_em, valor_abertura, _)) = caixa_aberto {
        let valor_movimentado: f64 = conn
            .query_row(
                "SELECT COALESCE(SUM(valor), 0) FROM caixa_movimentos WHERE caixa_sessao_id = ?1",
                params![sessao_id],
                |row| row.get(0),
            )
            .map_err(|e| format!("Falha ao calcular valor movimentado do caixa atual: {e}"))?;

        DashboardCaixaAtual {
            status: "ABERTO".to_string(),
            aberto_em: Some(aberto_em),
            valor_inicial: Some(valor_abertura),
            valor_movimentado,
        }
    } else {
        let latest_closed: Option<(String, f64)> = conn
            .query_row(
                "
                SELECT aberto_em, valor_abertura
                FROM caixa_sessoes
                WHERE usuario_abertura_id = ?1
                ORDER BY aberto_em DESC
                LIMIT 1
                ",
                params![usuario_id],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .ok();

        if let Some((aberto_em, valor_abertura)) = latest_closed {
            DashboardCaixaAtual {
                status: "FECHADO".to_string(),
                aberto_em: Some(aberto_em),
                valor_inicial: Some(valor_abertura),
                valor_movimentado: 0.0,
            }
        } else {
            DashboardCaixaAtual {
                status: "SEM_SESSAO".to_string(),
                aberto_em: None,
                valor_inicial: None,
                valor_movimentado: 0.0,
            }
        }
    };

    let mut stmt_ultimas = conn
        .prepare(
            "
            SELECT v.numero_venda, v.criado_em, c.nome, v.total, v.forma_pagamento, v.status
            FROM vendas v
            LEFT JOIN clientes c ON c.id = v.cliente_id
            ORDER BY v.criado_em DESC
            LIMIT 10
            ",
        )
        .map_err(|e| format!("Falha ao preparar ultimas vendas para dashboard: {e}"))?;

    let ultimas_rows = stmt_ultimas
        .query_map([], |row| {
            Ok(DashboardUltimaVendaItem {
                numero_venda: row.get(0)?,
                criado_em: row.get(1)?,
                cliente_nome: row.get(2)?,
                total: row.get(3)?,
                forma_pagamento: row.get(4)?,
                status: row.get(5)?,
            })
        })
        .map_err(|e| format!("Falha ao executar ultimas vendas para dashboard: {e}"))?;

    let mut ultimas_vendas = Vec::new();
    for row in ultimas_rows {
        ultimas_vendas.push(row.map_err(|e| format!("Falha ao iterar ultimas vendas do dashboard: {e}"))?);
    }

    let mut stmt_produtos = conn
        .prepare(
            "
            SELECT p.nome, COALESCE(SUM(iv.quantidade), 0) AS quantidade_vendida,
                   COALESCE(SUM(iv.subtotal), 0) AS total_vendido
            FROM itens_venda iv
            INNER JOIN vendas v ON v.id = iv.venda_id
            INNER JOIN produtos p ON p.id = iv.produto_id
            WHERE v.status = 'FINALIZADA'
            GROUP BY p.id, p.nome
            ORDER BY quantidade_vendida DESC, total_vendido DESC
            LIMIT 10
            ",
        )
        .map_err(|e| format!("Falha ao preparar produtos mais vendidos para dashboard: {e}"))?;

    let produtos_rows = stmt_produtos
        .query_map([], |row| {
            Ok(DashboardProdutoMaisVendidoItem {
                produto_nome: row.get(0)?,
                quantidade_vendida: row.get(1)?,
                total_vendido: row.get(2)?,
            })
        })
        .map_err(|e| format!("Falha ao executar produtos mais vendidos para dashboard: {e}"))?;

    let mut produtos_mais_vendidos = Vec::new();
    for row in produtos_rows {
        produtos_mais_vendidos
            .push(row.map_err(|e| format!("Falha ao iterar produtos mais vendidos do dashboard: {e}"))?);
    }

    Ok(DashboardResumo {
        total_vendido_dia,
        quantidade_vendas_dia,
        ticket_medio_dia,
        produtos_estoque_baixo,
        produtos_zerados,
        caixa_atual,
        ultimas_vendas,
        produtos_mais_vendidos,
    })
}

#[tauri::command]
fn report_sales_by_period(
    app: AppHandle,
    filters: Option<RelatorioVendasFilters>,
) -> Result<RelatorioVendasResponse, String> {
    let conn = open_connection(&app)?;
    let mut conditions: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(f) = &filters {
        if let Some(data_inicio) = &f.data_inicio {
            if !data_inicio.trim().is_empty() {
                conditions.push("date(v.criado_em) >= date(?)".to_string());
                values.push(Value::from(data_inicio.clone()));
            }
        }

        if let Some(data_fim) = &f.data_fim {
            if !data_fim.trim().is_empty() {
                conditions.push("date(v.criado_em) <= date(?)".to_string());
                values.push(Value::from(data_fim.clone()));
            }
        }

        if let Some(cliente_id) = f.cliente_id {
            conditions.push("v.cliente_id = ?".to_string());
            values.push(Value::from(cliente_id));
        }

        if let Some(status) = &f.status {
            if !status.trim().is_empty() {
                conditions.push("v.status = ?".to_string());
                values.push(Value::from(status.clone()));
            }
        }

        if let Some(forma_pagamento) = &f.forma_pagamento {
            if !forma_pagamento.trim().is_empty() {
                conditions.push("v.forma_pagamento = ?".to_string());
                values.push(Value::from(forma_pagamento.clone()));
            }
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql_itens = format!(
        "
        SELECT v.numero_venda, v.criado_em, c.nome, u.nome, v.forma_pagamento, v.subtotal, v.desconto, v.total, v.status
        FROM vendas v
        LEFT JOIN clientes c ON c.id = v.cliente_id
        INNER JOIN usuarios u ON u.id = v.usuario_id
        {}
        ORDER BY v.criado_em DESC
        ",
        where_clause
    );

    let mut stmt_itens = conn
        .prepare(&sql_itens)
        .map_err(|e| format!("Falha ao preparar relatorio de vendas por periodo: {e}"))?;

    let rows = stmt_itens
        .query_map(params_from_iter(values.clone()), |row| {
            Ok(RelatorioVendaItem {
                numero_venda: row.get(0)?,
                criado_em: row.get(1)?,
                cliente_nome: row.get(2)?,
                usuario_nome: row.get(3)?,
                forma_pagamento: row.get(4)?,
                subtotal: row.get(5)?,
                desconto: row.get(6)?,
                total: row.get(7)?,
                status: row.get(8)?,
            })
        })
        .map_err(|e| format!("Falha ao executar relatorio de vendas por periodo: {e}"))?;

    let mut itens = Vec::new();
    for row in rows {
        itens.push(row.map_err(|e| format!("Falha ao iterar vendas do relatorio: {e}"))?);
    }

    let sql_resumo = format!(
        "
        SELECT
            COUNT(1),
            COALESCE(SUM(CASE WHEN v.status = 'FINALIZADA' THEN v.total ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN v.status = 'FINALIZADA' THEN v.desconto ELSE 0 END), 0),
            COALESCE(AVG(CASE WHEN v.status = 'FINALIZADA' THEN v.total END), 0)
        FROM vendas v
        {}
        ",
        where_clause
    );

    let resumo = conn
        .query_row(&sql_resumo, params_from_iter(values), |row| {
            Ok(RelatorioVendasResumo {
                quantidade_vendas: row.get(0)?,
                total_vendido_finalizadas: row.get(1)?,
                total_descontos_finalizadas: row.get(2)?,
                ticket_medio_finalizadas: row.get(3)?,
            })
        })
        .map_err(|e| format!("Falha ao calcular resumo do relatorio de vendas: {e}"))?;

    Ok(RelatorioVendasResponse { itens, resumo })
}

#[tauri::command]
fn report_top_selling_products(
    app: AppHandle,
    filters: Option<RelatorioProdutosVendidosFilters>,
) -> Result<Vec<RelatorioProdutoMaisVendidoItem>, String> {
    let conn = open_connection(&app)?;
    let mut conditions: Vec<String> = vec!["v.status = 'FINALIZADA'".to_string()];
    let mut values: Vec<Value> = Vec::new();

    if let Some(f) = filters {
        if let Some(data_inicio) = f.data_inicio {
            if !data_inicio.trim().is_empty() {
                conditions.push("date(v.criado_em) >= date(?)".to_string());
                values.push(Value::from(data_inicio));
            }
        }

        if let Some(data_fim) = f.data_fim {
            if !data_fim.trim().is_empty() {
                conditions.push("date(v.criado_em) <= date(?)".to_string());
                values.push(Value::from(data_fim));
            }
        }

        if let Some(categoria_id) = f.categoria_id {
            conditions.push("p.categoria_id = ?".to_string());
            values.push(Value::from(categoria_id));
        }
    }

    let sql = format!(
        "
        SELECT p.nome, p.codigo, c.nome, COALESCE(SUM(iv.quantidade), 0), COALESCE(SUM(iv.subtotal), 0),
               COALESCE(SUM(iv.subtotal) / NULLIF(SUM(iv.quantidade), 0), 0)
        FROM itens_venda iv
        INNER JOIN vendas v ON v.id = iv.venda_id
        INNER JOIN produtos p ON p.id = iv.produto_id
        INNER JOIN categorias c ON c.id = p.categoria_id
        WHERE {}
        GROUP BY p.id, p.nome, p.codigo, c.nome
        ORDER BY COALESCE(SUM(iv.quantidade), 0) DESC, COALESCE(SUM(iv.subtotal), 0) DESC
        LIMIT 100
        ",
        conditions.join(" AND ")
    );

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("Falha ao preparar relatorio de produtos mais vendidos: {e}"))?;

    let rows = stmt
        .query_map(params_from_iter(values), |row| {
            Ok(RelatorioProdutoMaisVendidoItem {
                produto_nome: row.get(0)?,
                produto_codigo: row.get(1)?,
                categoria_nome: row.get(2)?,
                quantidade_vendida: row.get(3)?,
                total_vendido: row.get(4)?,
                preco_medio_praticado: row.get(5)?,
            })
        })
        .map_err(|e| format!("Falha ao executar relatorio de produtos mais vendidos: {e}"))?;

    let mut itens = Vec::new();
    for row in rows {
        itens.push(row.map_err(|e| format!("Falha ao iterar produtos mais vendidos: {e}"))?);
    }

    Ok(itens)
}

#[tauri::command]
fn report_current_stock(
    app: AppHandle,
    filters: Option<RelatorioEstoqueFilters>,
) -> Result<Vec<RelatorioEstoqueItem>, String> {
    let conn = open_connection(&app)?;
    let mut conditions: Vec<String> = Vec::new();
    let mut values: Vec<Value> = Vec::new();

    if let Some(f) = filters {
        if let Some(query) = f.query {
            let q_like = format!("%{}%", query.trim().to_lowercase());
            if !query.trim().is_empty() {
                conditions.push("(LOWER(p.nome) LIKE ? OR LOWER(p.codigo) LIKE ?)".to_string());
                values.push(Value::from(q_like.clone()));
                values.push(Value::from(q_like));
            }
        }

        if let Some(categoria_id) = f.categoria_id {
            conditions.push("p.categoria_id = ?".to_string());
            values.push(Value::from(categoria_id));
        }

        if let Some(ativo) = f.ativo {
            conditions.push("p.ativo = ?".to_string());
            values.push(Value::from(if ativo { 1 } else { 0 }));
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!(
        "
        SELECT p.codigo, p.nome, c.nome, p.estoque_atual, p.estoque_minimo, p.ativo
        FROM produtos p
        INNER JOIN categorias c ON c.id = p.categoria_id
        {}
        ORDER BY p.ativo DESC, p.nome
        ",
        where_clause
    );

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("Falha ao preparar relatorio de estoque atual: {e}"))?;

    let rows = stmt
        .query_map(params_from_iter(values), |row| {
            let estoque_atual: f64 = row.get(3)?;
            let estoque_minimo: f64 = row.get(4)?;
            let status = if estoque_atual <= 0.0 {
                "ZERADO"
            } else if estoque_atual <= estoque_minimo {
                "BAIXO"
            } else {
                "NORMAL"
            };

            Ok(RelatorioEstoqueItem {
                codigo: row.get(0)?,
                produto_nome: row.get(1)?,
                categoria_nome: row.get(2)?,
                estoque_atual,
                estoque_minimo,
                status_estoque: status.to_string(),
                ativo: row.get::<_, i64>(5)? == 1,
            })
        })
        .map_err(|e| format!("Falha ao executar relatorio de estoque atual: {e}"))?;

    let mut itens = Vec::new();
    for row in rows {
        itens.push(row.map_err(|e| format!("Falha ao iterar relatorio de estoque atual: {e}"))?);
    }

    Ok(itens)
}

#[tauri::command]
fn report_low_stock(
    app: AppHandle,
    filters: Option<RelatorioEstoqueBaixoFilters>,
) -> Result<Vec<RelatorioEstoqueBaixoItem>, String> {
    let conn = open_connection(&app)?;
    let mut conditions: Vec<String> = vec!["p.estoque_atual <= p.estoque_minimo".to_string()];
    let mut values: Vec<Value> = Vec::new();

    if let Some(f) = filters {
        if let Some(query) = f.query {
            let q_like = format!("%{}%", query.trim().to_lowercase());
            if !query.trim().is_empty() {
                conditions.push("(LOWER(p.nome) LIKE ? OR LOWER(p.codigo) LIKE ?)".to_string());
                values.push(Value::from(q_like.clone()));
                values.push(Value::from(q_like));
            }
        }

        if let Some(categoria_id) = f.categoria_id {
            conditions.push("p.categoria_id = ?".to_string());
            values.push(Value::from(categoria_id));
        }
    }

    let sql = format!(
        "
        SELECT p.codigo, p.nome, c.nome, p.estoque_atual, p.estoque_minimo
        FROM produtos p
        INNER JOIN categorias c ON c.id = p.categoria_id
        WHERE {}
        ORDER BY p.estoque_atual ASC, p.nome
        ",
        conditions.join(" AND ")
    );

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("Falha ao preparar relatorio de estoque baixo: {e}"))?;

    let rows = stmt
        .query_map(params_from_iter(values), |row| {
            let estoque_atual: f64 = row.get(3)?;
            let estoque_minimo: f64 = row.get(4)?;
            let status = if estoque_atual <= 0.0 { "ZERADO" } else { "BAIXO" };

            Ok(RelatorioEstoqueBaixoItem {
                codigo: row.get(0)?,
                produto_nome: row.get(1)?,
                categoria_nome: row.get(2)?,
                estoque_atual,
                estoque_minimo,
                diferenca_reposicao: (estoque_minimo - estoque_atual).max(0.0),
                status_estoque: status.to_string(),
            })
        })
        .map_err(|e| format!("Falha ao executar relatorio de estoque baixo: {e}"))?;

    let mut itens = Vec::new();
    for row in rows {
        itens.push(row.map_err(|e| format!("Falha ao iterar relatorio de estoque baixo: {e}"))?);
    }

    Ok(itens)
}

fn validate_configuracao_payload(payload: &UpsertConfiguracaoLojaPayload) -> Result<(), String> {
    if payload.nome_loja.trim().is_empty() {
        return Err("Nome da loja e obrigatorio".to_string());
    }

    match payload.tema.as_str() {
        "light" | "dark" => {}
        _ => return Err("Tema invalido".to_string()),
    }

    if payload.moeda.trim().is_empty() {
        return Err("Moeda e obrigatoria".to_string());
    }

    Ok(())
}

#[tauri::command]
fn get_store_configuration(app: AppHandle) -> Result<ConfiguracaoLoja, String> {
    let conn = open_connection(&app)?;

    let existing = conn
        .query_row(
            "
            SELECT id, nome_loja, cnpj, telefone, email, endereco, logo_path, tema, moeda
            FROM configuracao_loja
            ORDER BY id ASC
            LIMIT 1
            ",
            [],
            |row| {
                Ok(ConfiguracaoLoja {
                    id: row.get(0)?,
                    nome_loja: row.get(1)?,
                    cnpj: row.get(2)?,
                    telefone: row.get(3)?,
                    email: row.get(4)?,
                    endereco: row.get(5)?,
                    logo_path: row.get(6)?,
                    tema: row.get(7)?,
                    moeda: row.get(8)?,
                })
            },
        )
        .ok();

    if let Some(config) = existing {
        return Ok(config);
    }

    conn.execute(
        "
        INSERT INTO configuracao_loja (nome_loja, nome_fantasia, tema, moeda, atualizado_em)
        VALUES ('NEXLOJA', 'NEXLOJA', 'light', 'BRL', CURRENT_TIMESTAMP)
        ",
        [],
    )
    .map_err(|e| format!("Falha ao criar configuracao padrao da loja: {e}"))?;

    let id = conn.last_insert_rowid();

    Ok(ConfiguracaoLoja {
        id,
        nome_loja: "NEXLOJA".to_string(),
        cnpj: None,
        telefone: None,
        email: None,
        endereco: None,
        logo_path: None,
        tema: "light".to_string(),
        moeda: "BRL".to_string(),
    })
}

#[tauri::command]
fn update_store_configuration(
    app: AppHandle,
    payload: UpsertConfiguracaoLojaPayload,
) -> Result<ConfiguracaoLoja, String> {
    validate_configuracao_payload(&payload)?;
    let conn = open_connection(&app)?;

    let config = get_store_configuration(app.clone())?;

    conn.execute(
        "
        UPDATE configuracao_loja
        SET nome_loja = ?1,
            nome_fantasia = ?2,
            cnpj = ?3,
            telefone = ?4,
            email = ?5,
            endereco = ?6,
            logo_path = ?7,
            tema = ?8,
            moeda = ?9,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?10
        ",
        params![
            payload.nome_loja.trim().to_string(),
            payload.nome_loja.trim().to_string(),
            normalize_optional_text(&payload.cnpj),
            normalize_optional_text(&payload.telefone),
            normalize_optional_text(&payload.email),
            normalize_optional_text(&payload.endereco),
            normalize_optional_text(&payload.logo_path),
            payload.tema,
            payload.moeda,
            config.id
        ],
    )
    .map_err(|e| format!("Falha ao atualizar configuracao da loja: {e}"))?;

    get_store_configuration(app)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            initialize_database,
            login,
            list_categories,
            list_products,
            get_product_by_id,
            create_product,
            update_product,
            deactivate_product,
            list_clients,
            get_client_by_id,
            create_client,
            update_client,
            deactivate_client,
            list_stock,
            list_stock_products,
            list_stock_movements,
            register_stock_movement,
            get_current_cash_session,
            open_cash_session,
            list_cash_movements,
            close_cash_session,
            search_sale_products,
            create_sale,
            list_sales,
            get_sale_by_id,
            cancel_sale,
            get_dashboard_summary,
            report_sales_by_period,
            report_top_selling_products,
            report_current_stock,
            report_low_stock,
            get_store_configuration,
            update_store_configuration
        ])
        .run(tauri::generate_context!())
        .expect("erro ao executar aplicativo tauri");
}
