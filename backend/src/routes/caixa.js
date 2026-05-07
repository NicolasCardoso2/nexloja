const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/caixa/sessao-atual
router.get('/sessao-atual', (req, res) => {
  const db = getDb();
  const sessao = db.prepare(`
    SELECT * FROM caixa_sessoes WHERE status = 'ABERTO' ORDER BY aberto_em DESC LIMIT 1
  `).get();

  if (!sessao) {
    return res.status(404).json({ error: 'Nenhuma sessão de caixa aberta.' });
  }

  const totalMovimentos = db.prepare(`
    SELECT COALESCE(SUM(valor), 0) AS total FROM caixa_movimentos WHERE caixa_sessao_id = ?
  `).get(sessao.id);

  return res.json({
    ...sessao,
    status: sessao.status,
    total_movimentos: totalMovimentos.total,
    valor_final_calculado: sessao.valor_abertura + totalMovimentos.total
  });
});

// POST /api/caixa/abrir
router.post('/abrir', (req, res) => {
  const db = getDb();
  const sessaoAberta = db.prepare(`SELECT id FROM caixa_sessoes WHERE status = 'ABERTO'`).get();
  if (sessaoAberta) {
    return res.status(400).json({ error: 'Já existe um caixa aberto.' });
  }

  const { usuario_id, valor_inicial, observacoes } = req.body;
  if (usuario_id == null || valor_inicial == null) {
    return res.status(400).json({ error: 'usuario_id e valor_inicial são obrigatórios.' });
  }

  const result = db.prepare(`
    INSERT INTO caixa_sessoes (usuario_id, valor_abertura, status, observacao)
    VALUES (?, ?, 'ABERTO', ?)
  `).run(usuario_id, Number(valor_inicial), observacoes || null);

  db.prepare(`
    INSERT INTO caixa_movimentos (caixa_sessao_id, tipo, valor, observacao)
    VALUES (?, 'ABERTURA', ?, 'Abertura de caixa')
  `).run(result.lastInsertRowid, Number(valor_inicial));

  return res.status(201).json({ id: result.lastInsertRowid });
});

// POST /api/caixa/fechar
router.post('/fechar', (req, res) => {
  const db = getDb();
  const sessao = db.prepare(`SELECT * FROM caixa_sessoes WHERE status = 'ABERTO' ORDER BY aberto_em DESC LIMIT 1`).get();
  if (!sessao) return res.status(400).json({ error: 'Nenhum caixa aberto.' });

  const { valor_final_informado, observacoes } = req.body;
  if (valor_final_informado == null) {
    return res.status(400).json({ error: 'valor_final_informado é obrigatório.' });
  }

  const totalMovimentos = db.prepare(`
    SELECT COALESCE(SUM(valor), 0) AS total FROM caixa_movimentos WHERE caixa_sessao_id = ?
  `).get(sessao.id);

  const valorSistema = sessao.valor_abertura + totalMovimentos.total;
  const diferenca = Number(valor_final_informado) - valorSistema;

  db.prepare(`
    UPDATE caixa_sessoes SET
      status = 'FECHADO',
      fechado_em = datetime('now'),
      valor_fechamento = ?,
      valor_sistema = ?,
      diferenca = ?,
      observacao = ?
    WHERE id = ?
  `).run(Number(valor_final_informado), valorSistema, diferenca, observacoes || null, sessao.id);

  db.prepare(`
    INSERT INTO caixa_movimentos (caixa_sessao_id, tipo, valor, observacao)
    VALUES (?, 'FECHAMENTO', ?, 'Fechamento de caixa')
  `).run(sessao.id, Number(valor_final_informado));

  return res.json({ ok: true });
});

// GET /api/caixa/movimentos/:caixa_id
router.get('/movimentos/:caixa_id', (req, res) => {
  const db = getDb();
  const movimentos = db.prepare(`
    SELECT id, tipo, valor, observacao, criado_em
    FROM caixa_movimentos
    WHERE caixa_sessao_id = ?
    ORDER BY criado_em
  `).all(Number(req.params.caixa_id));
  return res.json(movimentos);
});

// POST /api/caixa/movimentos
router.post('/movimentos', (req, res) => {
  const { caixa_sessao_id, tipo, valor, observacao } = req.body;
  if (!caixa_sessao_id || !tipo || valor == null) {
    return res.status(400).json({ error: 'caixa_sessao_id, tipo e valor são obrigatórios.' });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO caixa_movimentos (caixa_sessao_id, tipo, valor, observacao)
    VALUES (?, ?, ?, ?)
  `).run(Number(caixa_sessao_id), tipo, Number(valor), observacao || null);

  return res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
