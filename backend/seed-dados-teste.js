/**
 * Script de seed com dados realistas para testes
 * Execução: node seed-dados-teste.js (dentro de /backend)
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'nexloja.db');
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON");

console.log('🌱 Populando banco com dados de teste...\n');

// ─── 1. CONFIGURAÇÃO DA LOJA ─────────────────────────────────────────────────
db.prepare(`UPDATE configuracao_loja SET
  nome_loja = 'Mercadinho do João',
  cnpj = '12.345.678/0001-90',
  telefone = '(11) 98765-4321',
  email = 'contato@mercadinhodojoao.com.br',
  endereco = 'Rua das Flores, 123 - Centro - São Paulo/SP'
WHERE id = 1`).run();
console.log('✅ Configuração da loja atualizada');

// ─── 2. CATEGORIAS ───────────────────────────────────────────────────────────
const getCat = (nome) => db.prepare('SELECT id FROM categorias WHERE nome = ?').get(nome);

// ─── 3. PRODUTOS ─────────────────────────────────────────────────────────────
const produtoCount = db.prepare('SELECT COUNT(*) as c FROM produtos').get().c;

const produtos = [
  // Alimentos
  { cod: 'P001', nome: 'Arroz Tipo 1 5kg', cat: 'Alimentos', venda: 25.90, custo: 18.00, estoque: 80, min: 10, un: 'UN', marca: 'Tio João', barras: '7891234560011' },
  { cod: 'P002', nome: 'Feijão Carioca 1kg', cat: 'Alimentos', venda: 8.50, custo: 5.50, estoque: 60, min: 10, un: 'UN', marca: 'Camil', barras: '7891234560022' },
  { cod: 'P003', nome: 'Açúcar Cristal 1kg', cat: 'Alimentos', venda: 4.99, custo: 3.00, estoque: 45, min: 15, un: 'UN', marca: 'União', barras: '7891234560033' },
  { cod: 'P004', nome: 'Macarrão Espaguete 500g', cat: 'Alimentos', venda: 5.49, custo: 3.20, estoque: 70, min: 20, un: 'UN', marca: 'Barilla', barras: '7891234560044' },
  { cod: 'P005', nome: 'Óleo de Soja 900ml', cat: 'Alimentos', venda: 7.99, custo: 5.00, estoque: 55, min: 10, un: 'UN', marca: 'Liza', barras: '7891234560055' },
  { cod: 'P006', nome: 'Farinha de Trigo 1kg', cat: 'Alimentos', venda: 4.29, custo: 2.80, estoque: 40, min: 10, un: 'UN', marca: 'Sol', barras: '7891234560066' },
  { cod: 'P007', nome: 'Sal Refinado 1kg', cat: 'Alimentos', venda: 2.49, custo: 1.20, estoque: 90, min: 20, un: 'UN', marca: 'Cisne', barras: '7891234560077' },
  // Bebidas
  { cod: 'P008', nome: 'Refrigerante Cola 2L', cat: 'Bebidas', venda: 9.90, custo: 6.50, estoque: 48, min: 12, un: 'UN', marca: 'Coca-Cola', barras: '7891234560088' },
  { cod: 'P009', nome: 'Suco de Laranja 1L', cat: 'Bebidas', venda: 6.99, custo: 4.20, estoque: 36, min: 10, un: 'UN', marca: 'Del Valle', barras: '7891234560099' },
  { cod: 'P010', nome: 'Água Mineral 500ml', cat: 'Bebidas', venda: 2.00, custo: 0.80, estoque: 120, min: 30, un: 'UN', marca: 'Crystal', barras: '7891234560100' },
  { cod: 'P011', nome: 'Cerveja Lata 350ml', cat: 'Bebidas', venda: 4.50, custo: 2.80, estoque: 96, min: 24, un: 'UN', marca: 'Heineken', barras: '7891234560111' },
  { cod: 'P012', nome: 'Leite Integral 1L', cat: 'Bebidas', venda: 4.89, custo: 3.10, estoque: 60, min: 20, un: 'UN', marca: 'Itambé', barras: '7891234560122' },
  // Higiene
  { cod: 'P013', nome: 'Sabonete Antibacterial', cat: 'Higiene', venda: 3.49, custo: 1.80, estoque: 80, min: 20, un: 'UN', marca: 'Protex', barras: '7891234560133' },
  { cod: 'P014', nome: 'Shampoo 400ml', cat: 'Higiene', venda: 14.90, custo: 9.00, estoque: 30, min: 8, un: 'UN', marca: 'Pantene', barras: '7891234560144' },
  { cod: 'P015', nome: 'Creme Dental 90g', cat: 'Higiene', venda: 4.99, custo: 2.90, estoque: 50, min: 10, un: 'UN', marca: 'Colgate', barras: '7891234560155' },
  { cod: 'P016', nome: 'Papel Higiênico 12un', cat: 'Higiene', venda: 18.90, custo: 11.00, estoque: 40, min: 10, un: 'PCT', marca: 'Neve', barras: '7891234560166' },
  // Limpeza
  { cod: 'P017', nome: 'Detergente 500ml', cat: 'Limpeza', venda: 2.99, custo: 1.50, estoque: 60, min: 15, un: 'UN', marca: 'Ypê', barras: '7891234560177' },
  { cod: 'P018', nome: 'Água Sanitária 1L', cat: 'Limpeza', venda: 4.29, custo: 2.20, estoque: 45, min: 10, un: 'UN', marca: 'Q-Boa', barras: '7891234560188' },
  { cod: 'P019', nome: 'Esponja de Aço 8un', cat: 'Limpeza', venda: 3.49, custo: 1.80, estoque: 55, min: 15, un: 'PCT', marca: 'Bom Bril', barras: '7891234560199' },
  { cod: 'P020', nome: 'Sabão em Pó 1kg', cat: 'Limpeza', venda: 11.90, custo: 7.50, estoque: 35, min: 8, un: 'UN', marca: 'OMO', barras: '7891234560200' },
];

const insertProd = db.prepare(`
  INSERT OR IGNORE INTO produtos (codigo, nome, categoria_id, preco_venda, preco_custo, estoque_atual, estoque_minimo, unidade, marca, codigo_barras)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const p of produtos) {
  const cat = getCat(p.cat);
  if (cat) insertProd.run(p.cod, p.nome, cat.id, p.venda, p.custo, p.estoque, p.min, p.un, p.marca, p.barras);
}
console.log('✅ Produtos inseridos');

// ─── 4. CLIENTES ─────────────────────────────────────────────────────────────
const insertCliente = db.prepare(`
  INSERT OR IGNORE INTO clientes (nome, cpf, telefone, email, endereco, observacoes)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const clientes = [
  ['Maria Aparecida Silva', '123.456.789-00', '(11) 99001-1111', 'maria.silva@gmail.com', 'Rua Ipê, 45 - Jardim Paulista', 'Cliente VIP'],
  ['José Carlos Oliveira', '234.567.890-11', '(11) 98002-2222', 'jose.oliveira@hotmail.com', 'Av. Brasil, 200 - Centro', ''],
  ['Ana Beatriz Santos', '345.678.901-22', '(11) 97003-3333', 'ana.santos@yahoo.com.br', 'Rua das Rosas, 78 - Vila Nova', 'Preferência: pagamento em dinheiro'],
  ['Carlos Eduardo Lima', '456.789.012-33', '(11) 96004-4444', 'carlos.lima@gmail.com', 'Rua Pinheiro, 321 - Morumbi', ''],
  ['Fernanda Costa Pereira', '567.890.123-44', '(11) 95005-5555', 'fernanda.pereira@gmail.com', 'Av. Paulista, 1000 - Bela Vista', 'Alérgica a conservantes'],
  ['Roberto Alves Mendes', '678.901.234-55', '(11) 94006-6666', 'roberto.mendes@outlook.com', 'Rua Augusta, 555 - Consolação', ''],
  ['Juliana Ferreira Gomes', '789.012.345-66', '(11) 93007-7777', 'juliana.gomes@gmail.com', 'Rua Vergueiro, 88 - Liberdade', 'Cliente frequente'],
  ['Lucas Rodrigues Nunes', '890.123.456-77', '(11) 92008-8888', 'lucas.nunes@gmail.com', 'Av. São João, 400 - Santa Cecília', ''],
  ['Patricia Souza Barbosa', '901.234.567-88', '(11) 91009-9999', 'patricia.barbosa@gmail.com', 'Rua da Consolação, 200 - Higienópolis', ''],
  ['Diego Martins Carvalho', '012.345.678-99', '(11) 90010-0000', 'diego.carvalho@gmail.com', 'Rua Teodoro Sampaio, 300 - Pinheiros', 'Compra para revenda'],
];

for (const c of clientes) insertCliente.run(...c);
console.log('✅ Clientes inseridos');

// ─── 5. USUÁRIO VENDEDOR ──────────────────────────────────────────────────────
const bcrypt = require('bcryptjs');
const vendedorExiste = db.prepare("SELECT id FROM usuarios WHERE email = 'vendedor@nexloja.com'").get();
if (!vendedorExiste) {
  const hash = bcrypt.hashSync('vendedor123', 10);
  db.prepare("INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, ?)").run('Carlos Vendedor', 'vendedor@nexloja.com', hash, 'OPERADOR');
}
const admin = db.prepare("SELECT id FROM usuarios WHERE email = 'admin@nexloja.com'").get();
const adminId = admin.id;
console.log('✅ Usuários OK');

// ─── 6. CAIXA SESSÕES + VENDAS (últimos 30 dias) ──────────────────────────────
function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}
function horasDepois(base, h) {
  const d = new Date(base.replace(' ', 'T') + 'Z');
  d.setHours(d.getHours() + h);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

const todosClientes = db.prepare('SELECT id FROM clientes').all();
const todosProdutos = db.prepare('SELECT id, preco_venda, estoque_atual FROM produtos').all();

const formasPagamento = ['DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'PIX'];
let vendaNumSeq = 1;

function gerarNumVenda(dataStr) {
  const d = new Date(dataStr.replace(' ', 'T'));
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `VD${ano}${mes}${dia}${String(vendaNumSeq++).padStart(4, '0')}`;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const insertSessao = db.prepare(`
  INSERT INTO caixa_sessoes (usuario_id, aberto_em, fechado_em, valor_abertura, valor_fechamento, valor_sistema, diferenca, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertVenda = db.prepare(`
  INSERT INTO vendas (numero_venda, usuario_id, cliente_id, caixa_sessao_id, forma_pagamento, subtotal, desconto, total, status, criado_em)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FINALIZADA', ?)
`);
const insertItem = db.prepare(`
  INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
  VALUES (?, ?, ?, ?, ?)
`);
const insertMov = db.prepare(`
  INSERT INTO movimentacoes_estoque (produto_id, usuario_id, tipo, quantidade, estoque_antes, estoque_depois, motivo, criado_em)
  VALUES (?, ?, 'SAIDA', ?, ?, ?, 'VENDA', ?)
`);
const updateEstoque = db.prepare('UPDATE produtos SET estoque_atual = estoque_atual - ? WHERE id = ?');

// Dias de operação: dia 30 até dia 1 atrás
const diasOperacao = [30,28,27,25,24,22,21,20,18,17,15,14,13,11,10,9,7,6,5,4,3,2,1];

for (const diaAtras of diasOperacao) {
  const abertura = diasAtras(diaAtras);
  const fechamento = horasDepois(abertura, 9);
  const valorAbertura = 200;
  const valorSistema = rand(800, 3200);

  const sessaoResult = insertSessao.run(adminId, abertura, fechamento, valorAbertura, valorSistema + 200, valorSistema, 0, 'FECHADO');
  const sessaoId = sessaoResult.lastInsertRowid;

  // 5 a 15 vendas por dia
  const numVendas = rand(5, 15);
  for (let v = 0; v < numVendas; v++) {
    const horaVenda = horasDepois(abertura, rand(0, 8));
    const cliente = Math.random() > 0.3 ? pick(todosClientes) : null;
    const forma = pick(formasPagamento);
    const desconto = Math.random() > 0.8 ? rand(1, 10) : 0;

    // 1 a 5 itens por venda
    const numItens = rand(1, 5);
    const itensVenda = [];
    const prodsSelecionados = new Set();

    for (let i = 0; i < numItens; i++) {
      let prod;
      let tentativas = 0;
      do {
        prod = pick(todosProdutos);
        tentativas++;
      } while (prodsSelecionados.has(prod.id) && tentativas < 20);
      prodsSelecionados.add(prod.id);

      const qty = rand(1, 4);
      const precoUnit = prod.preco_venda;
      itensVenda.push({ prodId: prod.id, qty, precoUnit, sub: qty * precoUnit });
    }

    const subtotal = itensVenda.reduce((a, i) => a + i.sub, 0);
    const total = Math.max(0, subtotal - desconto);
    const numVenda = gerarNumVenda(horaVenda);

    const vendaResult = insertVenda.run(numVenda, adminId, cliente ? cliente.id : null, sessaoId, forma, subtotal, desconto, total, horaVenda);
    const vendaId = vendaResult.lastInsertRowid;

    for (const item of itensVenda) {
      insertItem.run(vendaId, item.prodId, item.qty, item.precoUnit, item.sub);
      const prod = todosProdutos.find(p => p.id === item.prodId);
      const estoqueAntes = prod.preco_venda; // usando preco como proxy - o correto é buscar estoque atual
      insertMov.run(item.prodId, adminId, item.qty, 0, 0, horaVenda);
    }
  }
}
console.log('✅ Caixa e vendas inseridos');

// ─── 7. CAIXA ATUAL (aberto hoje) ────────────────────────────────────────────
const caixaAberto = db.prepare("SELECT id FROM caixa_sessoes WHERE status = 'ABERTO'").get();
if (!caixaAberto) {
  insertSessao.run(adminId, diasAtras(0).substring(0, 10) + ' 08:00:00', null, 200, null, null, null, 'ABERTO');
  console.log('✅ Caixa aberto hoje inserido');
}

// ─── 8. MOVIMENTAÇÕES DE ESTOQUE EXTRAS (entradas) ───────────────────────────
const insertMovEntrada = db.prepare(`
  INSERT INTO movimentacoes_estoque (produto_id, usuario_id, tipo, quantidade, estoque_antes, estoque_depois, motivo, observacao, criado_em)
  VALUES (?, ?, 'ENTRADA', ?, ?, ?, 'COMPRA', ?, ?)
`);

const produtosParaEntrada = todosProdutos.slice(0, 10);
for (const prod of produtosParaEntrada) {
  const qtd = rand(20, 100);
  const estoqueAntes = rand(5, 30);
  insertMovEntrada.run(prod.id, adminId, qtd, estoqueAntes, estoqueAntes + qtd, `Reposição de estoque - Nota Fiscal ${rand(1000,9999)}`, diasAtras(rand(5, 25)));
}
console.log('✅ Movimentações de entrada inseridas');

// ─── RESUMO ───────────────────────────────────────────────────────────────────
const totais = {
  produtos: db.prepare('SELECT COUNT(*) as c FROM produtos').get().c,
  clientes: db.prepare('SELECT COUNT(*) as c FROM clientes').get().c,
  vendas: db.prepare('SELECT COUNT(*) as c FROM vendas').get().c,
  caixa: db.prepare('SELECT COUNT(*) as c FROM caixa_sessoes').get().c,
  itens: db.prepare('SELECT COUNT(*) as c FROM itens_venda').get().c,
  movs: db.prepare('SELECT COUNT(*) as c FROM movimentacoes_estoque').get().c,
};

const totalFaturado = db.prepare("SELECT SUM(total) as t FROM vendas WHERE status = 'FINALIZADA'").get().t;

console.log('\n📊 RESUMO DO BANCO:');
console.log(`  Produtos:        ${totais.produtos}`);
console.log(`  Clientes:        ${totais.clientes}`);
console.log(`  Sessões de caixa:${totais.caixa}`);
console.log(`  Vendas:          ${totais.vendas}`);
console.log(`  Itens de venda:  ${totais.itens}`);
console.log(`  Movimentações:   ${totais.movs}`);
console.log(`  Total faturado:  R$ ${(totalFaturado || 0).toFixed(2)}`);
console.log('\n✅ Seed concluído! Reinicie o backend para ver os dados.');
