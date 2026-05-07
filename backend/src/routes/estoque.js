const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/estoque
router.get('/', (req, res) => {
  const query = String(req.query.query || '').trim();
  const categoriaId = Number(req.query.categoriaId || 0);
  const apenasEstoqueBaixo = String(req.query.apenasEstoqueBaixo || '').toLowerCase() === 'true';

  const where = [];
  const params = [];

  if (query) {
    where.push("(lower(p.nome) LIKE lower(?) OR lower(p.codigo) LIKE lower(?) OR lower(COALESCE(p.codigo_barras, '')) LIKE lower(?))");
    const like = `%${query}%`;
    params.push(like, like, like);
  }

  if (Number.isInteger(categoriaId) && categoriaId > 0) {
    where.push('p.categoria_id = ?');
    params.push(categoriaId);
  }

  if (apenasEstoqueBaixo) {
    where.push('p.estoque_atual <= p.estoque_minimo');
  }

  const ativo = req.query.ativo; // 'true' | 'false' | undefined
  if (ativo === 'true') where.push('p.ativo = 1');
  else if (ativo === 'false') where.push('p.ativo = 0');

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const db = getDb();
  const itens = db.prepare(`
    SELECT
      p.id AS produto_id, p.codigo, p.nome,
      p.categoria_id, c.nome AS categoria_nome,
      p.estoque_atual, p.estoque_minimo, p.ativo,
      CASE
        WHEN p.estoque_atual = 0 THEN 'ZERADO'
        WHEN p.estoque_atual <= p.estoque_minimo THEN 'BAIXO'
        ELSE 'NORMAL'
      END AS status_estoque
    FROM produtos p
    LEFT JOIN categorias c ON c.id = p.categoria_id
    ${whereClause}
    ORDER BY p.nome
  `).all(...params);
  return res.json(itens.map(i => ({ ...i, ativo: Boolean(i.ativo) })));
});

// GET /api/estoque/movimentacoes
router.get('/movimentacoes', (req, res) => {
  const produtoId = Number(req.query.produtoId || 0);
  const where = [];
  const params = [];

  if (Number.isInteger(produtoId) && produtoId > 0) {
    where.push('me.produto_id = ?');
    params.push(produtoId);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const db = getDb();
  const movs = db.prepare(`
    SELECT
      me.id, me.produto_id, p.nome AS produto_nome, p.codigo AS produto_codigo,
      me.tipo, me.quantidade, me.estoque_antes, me.estoque_depois,
      me.motivo, me.observacao, me.usuario_id, me.criado_em
    FROM movimentacoes_estoque me
    LEFT JOIN produtos p ON p.id = me.produto_id
    ${whereClause}
    ORDER BY me.criado_em DESC
  `).all(...params);
  return res.json(movs);
});

// POST /api/estoque/movimentacoes
router.post('/movimentacoes', (req, res) => {
  const { produto_id, usuario_id, tipo, quantidade, motivo, observacao } = req.body;
  if (!produto_id || !usuario_id || !tipo || quantidade == null || !motivo) {
    return res.status(400).json({ error: 'Campos obrigatórios: produto_id, usuario_id, tipo, quantidade, motivo.' });
  }

  const db = getDb();
  const produto = db.prepare('SELECT id, estoque_atual FROM produtos WHERE id = ?').get(Number(produto_id));
  if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

  const estoqueAntes = produto.estoque_atual;
  let estoqueDepois;

  if (tipo === 'ENTRADA') {
    estoqueDepois = estoqueAntes + Number(quantidade);
  } else if (tipo === 'SAIDA') {
    estoqueDepois = estoqueAntes - Number(quantidade);
    if (estoqueDepois < 0) return res.status(400).json({ error: 'Estoque insuficiente.' });
  } else if (tipo === 'AJUSTE') {
    estoqueDepois = Number(quantidade);
  } else {
    return res.status(400).json({ error: 'Tipo inválido. Use ENTRADA, SAIDA ou AJUSTE.' });
  }

  db.prepare('UPDATE produtos SET estoque_atual = ? WHERE id = ?').run(estoqueDepois, produto.id);

  const result = db.prepare(`
    INSERT INTO movimentacoes_estoque
      (produto_id, usuario_id, tipo, quantidade, estoque_antes, estoque_depois, motivo, observacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(produto.id, Number(usuario_id), tipo, Number(quantidade), estoqueAntes, estoqueDepois, motivo, observacao || null);

  return res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
