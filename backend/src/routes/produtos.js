const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/produtos
router.get('/', (req, res) => {
  const query = String(req.query.query || '').trim();
  const categoriaId = Number(req.query.categoriaId || 0);
  const ativo = req.query.ativo; // 'true' | 'false' | undefined

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
  if (ativo === 'true') where.push('p.ativo = 1');
  else if (ativo === 'false') where.push('p.ativo = 0');

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const db = getDb();
  const produtos = db.prepare(`
    SELECT
      p.id, p.codigo, p.nome, p.categoria_id,
      c.nome AS categoria_nome,
      p.preco_venda, p.estoque_atual, p.ativo, p.codigo_barras
    FROM produtos p
    LEFT JOIN categorias c ON c.id = p.categoria_id
    ${whereClause}
    ORDER BY p.nome
  `).all(...params);
  return res.json(produtos.map(p => ({ ...p, ativo: Boolean(p.ativo) })));
});

// GET /api/produtos/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const produto = db.prepare(`
    SELECT
      p.id, p.codigo, p.nome, p.categoria_id,
      c.nome AS categoria_nome,
      p.preco_venda, p.preco_custo, p.estoque_atual, p.estoque_minimo,
      p.ativo, p.codigo_barras, p.descricao, p.marca, p.unidade, p.imagem_path
    FROM produtos p
    LEFT JOIN categorias c ON c.id = p.categoria_id
    WHERE p.id = ?
  `).get(Number(req.params.id));

  if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });
  return res.json({ ...produto, ativo: Boolean(produto.ativo) });
});

// POST /api/produtos
router.post('/', (req, res) => {
  const { codigo, nome, categoria_id, preco_venda, preco_custo, estoque_atual, estoque_minimo,
    ativo, codigo_barras, descricao, marca, unidade, imagem_path } = req.body;

  if (!codigo || !nome || !categoria_id || preco_venda == null) {
    return res.status(400).json({ error: 'Campos obrigatórios: codigo, nome, categoria_id, preco_venda.' });
  }

  const db = getDb();
  try {
    const result = db.prepare(`
      INSERT INTO produtos
        (codigo, nome, categoria_id, preco_venda, preco_custo, estoque_atual, estoque_minimo,
         ativo, codigo_barras, descricao, marca, unidade, imagem_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      codigo, nome, Number(categoria_id), Number(preco_venda), Number(preco_custo || 0),
      Number(estoque_atual || 0), Number(estoque_minimo || 0),
      ativo !== false ? 1 : 0,
      codigo_barras || null, descricao || null, marca || null,
      unidade || 'UN', imagem_path || null
    );
    return res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Código de produto já cadastrado.' });
    }
    throw err;
  }
});

// PUT /api/produtos/:id
router.put('/:id', (req, res) => {
  const { codigo, nome, categoria_id, preco_venda, preco_custo, estoque_atual, estoque_minimo,
    ativo, codigo_barras, descricao, marca, unidade, imagem_path } = req.body;

  const db = getDb();
  const existe = db.prepare('SELECT id FROM produtos WHERE id = ?').get(Number(req.params.id));
  if (!existe) return res.status(404).json({ error: 'Produto não encontrado.' });

  db.prepare(`
    UPDATE produtos SET
      codigo = ?, nome = ?, categoria_id = ?, preco_venda = ?, preco_custo = ?,
      estoque_atual = ?, estoque_minimo = ?, ativo = ?,
      codigo_barras = ?, descricao = ?, marca = ?, unidade = ?, imagem_path = ?,
      atualizado_em = datetime('now')
    WHERE id = ?
  `).run(
    codigo, nome, Number(categoria_id), Number(preco_venda), Number(preco_custo || 0),
    Number(estoque_atual || 0), Number(estoque_minimo || 0),
    ativo !== false ? 1 : 0,
    codigo_barras || null, descricao || null, marca || null,
    unidade || 'UN', imagem_path || null,
    Number(req.params.id)
  );

  return res.json({ ok: true });
});

module.exports = router;
