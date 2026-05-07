const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/clientes
router.get('/', (req, res) => {
  const query = String(req.query.query || '').trim();
  const ativo = req.query.ativo; // 'true' | 'false' | undefined

  const where = [];
  const params = [];

  if (query) {
    where.push("(lower(nome) LIKE lower(?) OR lower(COALESCE(cpf, '')) LIKE lower(?) OR lower(COALESCE(telefone, '')) LIKE lower(?))");
    const like = `%${query}%`;
    params.push(like, like, like);
  }
  if (ativo === 'true') where.push('ativo = 1');
  else if (ativo === 'false') where.push('ativo = 0');

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const db = getDb();
  const clientes = db.prepare(`
    SELECT id, nome, cpf, telefone, email, ativo
    FROM clientes
    ${whereClause}
    ORDER BY nome
  `).all(...params);
  return res.json(clientes.map(c => ({ ...c, ativo: Boolean(c.ativo) })));
});

// GET /api/clientes/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const cliente = db.prepare(`
    SELECT id, nome, cpf, telefone, email, endereco, observacoes, ativo
    FROM clientes WHERE id = ?
  `).get(Number(req.params.id));

  if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });

  const resumo = db.prepare(`
    SELECT
      COUNT(*) AS quantidade_vendas,
      COALESCE(SUM(total), 0) AS total_gasto,
      MAX(criado_em) AS ultima_compra_em
    FROM vendas WHERE cliente_id = ? AND status = 'FINALIZADA'
  `).get(cliente.id);

  return res.json({
    ...cliente,
    ativo: Boolean(cliente.ativo),
    resumo_compras: {
      quantidade_vendas: resumo.quantidade_vendas,
      total_gasto: resumo.total_gasto,
      ultima_compra_em: resumo.ultima_compra_em || null
    }
  });
});

// POST /api/clientes
router.post('/', (req, res) => {
  const { nome, cpf, telefone, email, endereco, observacoes, ativo } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome do cliente é obrigatório.' });

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO clientes (nome, cpf, telefone, email, endereco, observacoes, ativo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(nome, cpf || null, telefone || null, email || null,
    endereco || null, observacoes || null, ativo !== false ? 1 : 0);

  return res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/clientes/:id
router.put('/:id', (req, res) => {
  const { nome, cpf, telefone, email, endereco, observacoes, ativo } = req.body;
  const db = getDb();
  const existe = db.prepare('SELECT id FROM clientes WHERE id = ?').get(Number(req.params.id));
  if (!existe) return res.status(404).json({ error: 'Cliente não encontrado.' });

  db.prepare(`
    UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, email = ?,
      endereco = ?, observacoes = ?, ativo = ?
    WHERE id = ?
  `).run(nome, cpf || null, telefone || null, email || null,
    endereco || null, observacoes || null, ativo !== false ? 1 : 0,
    Number(req.params.id));

  return res.json({ ok: true });
});

module.exports = router;
