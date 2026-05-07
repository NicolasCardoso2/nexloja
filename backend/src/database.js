const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('node:fs');

// Em produção (Electron), o banco fica em AppData passado via env NEXLOJA_DATA_DIR
// Em desenvolvimento, fica em backend/data/ como sempre
const dataDir = process.env.NEXLOJA_DATA_DIR
  ? process.env.NEXLOJA_DATA_DIR
  : path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'nexloja.db');

let db;

function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'OPERADOR',
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      categoria_id INTEGER NOT NULL,
      preco_venda REAL NOT NULL DEFAULT 0,
      preco_custo REAL NOT NULL DEFAULT 0,
      estoque_atual REAL NOT NULL DEFAULT 0,
      estoque_minimo REAL NOT NULL DEFAULT 0,
      ativo INTEGER NOT NULL DEFAULT 1,
      codigo_barras TEXT,
      descricao TEXT,
      marca TEXT,
      unidade TEXT NOT NULL DEFAULT 'UN',
      imagem_path TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT,
      telefone TEXT,
      email TEXT,
      endereco TEXT,
      observacoes TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS caixa_sessoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      aberto_em TEXT NOT NULL DEFAULT (datetime('now')),
      fechado_em TEXT,
      valor_abertura REAL NOT NULL DEFAULT 0,
      valor_fechamento REAL,
      valor_sistema REAL,
      diferenca REAL,
      status TEXT NOT NULL DEFAULT 'ABERTO',
      observacao TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS caixa_movimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caixa_sessao_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      valor REAL NOT NULL,
      observacao TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (caixa_sessao_id) REFERENCES caixa_sessoes(id)
    );

    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_venda TEXT NOT NULL UNIQUE,
      usuario_id INTEGER NOT NULL,
      cliente_id INTEGER,
      caixa_sessao_id INTEGER NOT NULL,
      forma_pagamento TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      desconto REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'FINALIZADA',
      cancelado_em TEXT,
      motivo_cancelamento TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (caixa_sessao_id) REFERENCES caixa_sessoes(id)
    );

    CREATE TABLE IF NOT EXISTS itens_venda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      quantidade REAL NOT NULL,
      preco_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (venda_id) REFERENCES vendas(id),
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    );

    CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      quantidade REAL NOT NULL,
      estoque_antes REAL NOT NULL,
      estoque_depois REAL NOT NULL,
      motivo TEXT NOT NULL,
      observacao TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (produto_id) REFERENCES produtos(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS configuracao_loja (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_loja TEXT NOT NULL DEFAULT 'Minha Loja',
      cnpj TEXT,
      telefone TEXT,
      email TEXT,
      endereco TEXT,
      logo_path TEXT,
      tema TEXT NOT NULL DEFAULT 'light',
      moeda TEXT NOT NULL DEFAULT 'BRL',
      meta_diaria REAL NOT NULL DEFAULT 0
    );
  `);

  // Seed dados iniciais
  const adminExiste = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@nexloja.com');
  if (!adminExiste) {
    const senhaHash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO usuarios (nome, email, senha_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('Administrador', 'admin@nexloja.com', senhaHash, 'ADMIN');
  } else if (process.env.NEXLOJA_DATA_DIR) {
    const admin = db.prepare('SELECT id, senha_hash FROM usuarios WHERE email = ? LIMIT 1').get('admin@nexloja.com');
    let senhaPadraoValida = false;
    try {
      senhaPadraoValida = bcrypt.compareSync('admin123', admin.senha_hash);
    } catch (_) {
      senhaPadraoValida = false;
    }

    if (!senhaPadraoValida) {
      const senhaHash = bcrypt.hashSync('admin123', 10);
      db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(senhaHash, admin.id);
      console.log('Senha padrão do admin foi restaurada para o app desktop.');
    }
  }

  const categoriaCount = db.prepare('SELECT COUNT(*) as c FROM categorias').get();
  if (categoriaCount.c === 0) {
    const insertCat = db.prepare('INSERT INTO categorias (nome) VALUES (?)');
    ['Alimentos', 'Bebidas', 'Higiene', 'Limpeza', 'Eletrônicos', 'Vestuário', 'Outros'].forEach(nome => {
      insertCat.run(nome);
    });
  }

  const configExiste = db.prepare('SELECT id FROM configuracao_loja').get();
  if (!configExiste) {
    db.prepare(`
      INSERT INTO configuracao_loja (nome_loja, tema, moeda, meta_diaria)
      VALUES ('NexLoja', 'light', 'BRL', 0)
    `).run();
  } else {
    // migration: add meta_diaria if column doesn't exist yet
    try {
      db.exec('ALTER TABLE configuracao_loja ADD COLUMN meta_diaria REAL NOT NULL DEFAULT 0');
    } catch (_) { /* column already exists */ }
  }

  // Seed produtos de exemplo
  const produtoCount = db.prepare('SELECT COUNT(*) as c FROM produtos').get();
  if (produtoCount.c === 0) {
    const cat = db.prepare('SELECT id FROM categorias WHERE nome = ?').get('Alimentos');
    if (cat) {
      const insertProd = db.prepare(`
        INSERT INTO produtos (codigo, nome, categoria_id, preco_venda, preco_custo, estoque_atual, estoque_minimo, unidade)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertProd.run('P001', 'Arroz 5kg', cat.id, 25.90, 18.00, 50, 10, 'UN');
      insertProd.run('P002', 'Feijão 1kg', cat.id, 8.50, 5.50, 30, 5, 'UN');
      insertProd.run('P003', 'Açúcar 1kg', cat.id, 4.99, 3.00, 0, 5, 'UN');
    }
  }

  console.log('Banco de dados inicializado com sucesso.');
}

module.exports = { getDb, initializeDatabase };
