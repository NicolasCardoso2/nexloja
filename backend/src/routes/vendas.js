const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const { gerarNumeroVenda } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

// GET /api/vendas/buscar-produtos  (deve vir antes de /:id)
router.get('/buscar-produtos', (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  const db = getDb();
  const term = `%${query}%`;
  const produtos = db.prepare(`
    SELECT id, codigo, codigo_barras, nome, preco_venda, estoque_atual, ativo
    FROM produtos
    WHERE ativo = 1 AND (nome LIKE ? OR codigo LIKE ? OR codigo_barras LIKE ?)
    ORDER BY nome LIMIT 20
  `).all(term, term, term);

  return res.json(produtos.map(p => ({ ...p, ativo: Boolean(p.ativo) })));
});

// GET /api/vendas
router.get('/', (req, res) => {
  const dataInicio = String(req.query.dataInicio || '').trim();
  const dataFim = String(req.query.dataFim || '').trim();
  const clienteId = Number(req.query.clienteId || 0);
  const status = String(req.query.status || '').trim();

  const where = [];
  const params = [];

  if (dataInicio) { where.push('date(v.criado_em) >= ?'); params.push(dataInicio); }
  if (dataFim) { where.push('date(v.criado_em) <= ?'); params.push(dataFim); }
  if (Number.isInteger(clienteId) && clienteId > 0) { where.push('v.cliente_id = ?'); params.push(clienteId); }
  if (status) { where.push('v.status = ?'); params.push(status); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const db = getDb();
  const vendas = db.prepare(`
    SELECT
      v.id, v.numero_venda, v.criado_em,
      c.nome AS cliente_nome,
      u.nome AS usuario_nome,
      v.forma_pagamento, v.total, v.status
    FROM vendas v
    LEFT JOIN clientes c ON c.id = v.cliente_id
    LEFT JOIN usuarios u ON u.id = v.usuario_id
    ${whereClause}
    ORDER BY v.criado_em DESC
  `).all(...params);
  return res.json(vendas);
});

// GET /api/vendas/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const venda = db.prepare(`
    SELECT
      v.id, v.numero_venda, v.criado_em,
      v.cliente_id, c.nome AS cliente_nome,
      v.usuario_id, u.nome AS usuario_nome,
      v.caixa_sessao_id,
      v.forma_pagamento, v.subtotal, v.desconto, v.total, v.status,
      v.cancelado_em, v.motivo_cancelamento
    FROM vendas v
    LEFT JOIN clientes c ON c.id = v.cliente_id
    LEFT JOIN usuarios u ON u.id = v.usuario_id
    WHERE v.id = ?
  `).get(Number(req.params.id));

  if (!venda) return res.status(404).json({ error: 'Venda não encontrada.' });

  const itens = db.prepare(`
    SELECT iv.id, iv.produto_id, p.nome AS produto_nome, p.codigo AS produto_codigo,
      iv.quantidade, iv.preco_unitario, iv.subtotal
    FROM itens_venda iv
    LEFT JOIN produtos p ON p.id = iv.produto_id
    WHERE iv.venda_id = ?
  `).all(venda.id);

  return res.json({ ...venda, itens });
});

// POST /api/vendas
router.post('/', (req, res) => {
  const { usuario_id, cliente_id, desconto, forma_pagamento, itens } = req.body;

  if (!usuario_id || !forma_pagamento || !itens || itens.length === 0) {
    return res.status(400).json({ error: 'Campos obrigatórios: usuario_id, forma_pagamento, itens.' });
  }

  const db = getDb();

  // Verificar caixa aberto
  const caixa = db.prepare(`SELECT id FROM caixa_sessoes WHERE status = 'ABERTO' ORDER BY aberto_em DESC LIMIT 1`).get();
  if (!caixa) {
    return res.status(400).json({ error: 'Nenhum caixa aberto. Abra o caixa antes de realizar vendas.' });
  }

  const criarVenda = db.transaction(() => {
    let subtotal = 0;

    // Calcular subtotal e validar estoque
    for (const item of itens) {
      const produto = db.prepare('SELECT id, preco_venda, estoque_atual FROM produtos WHERE id = ? AND ativo = 1').get(item.produto_id);
      if (!produto) throw new Error(`Produto ${item.produto_id} não encontrado ou inativo.`);
      if (produto.estoque_atual < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto ID ${item.produto_id}.`);
      }
      subtotal += produto.preco_venda * item.quantidade;
    }

    const descontoVal = Number(desconto || 0);
    const total = Math.max(0, subtotal - descontoVal);
    const numeroVenda = gerarNumeroVenda(db);

    const vendaResult = db.prepare(`
      INSERT INTO vendas (numero_venda, usuario_id, cliente_id, caixa_sessao_id, forma_pagamento, subtotal, desconto, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FINALIZADA')
    `).run(numeroVenda, usuario_id, cliente_id || null, caixa.id, forma_pagamento, subtotal, descontoVal, total);

    const vendaId = vendaResult.lastInsertRowid;

    for (const item of itens) {
      const produto = db.prepare('SELECT preco_venda, estoque_atual FROM produtos WHERE id = ?').get(item.produto_id);
      const itemSubtotal = produto.preco_venda * item.quantidade;

      db.prepare(`
        INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `).run(vendaId, item.produto_id, item.quantidade, produto.preco_venda, itemSubtotal);

      // Atualizar estoque
      const novoEstoque = produto.estoque_atual - item.quantidade;
      db.prepare('UPDATE produtos SET estoque_atual = ? WHERE id = ?').run(novoEstoque, item.produto_id);

      // Registrar movimentação
      db.prepare(`
        INSERT INTO movimentacoes_estoque (produto_id, usuario_id, tipo, quantidade, estoque_antes, estoque_depois, motivo)
        VALUES (?, ?, 'SAIDA', ?, ?, ?, 'Venda')
      `).run(item.produto_id, usuario_id, item.quantidade, produto.estoque_atual, novoEstoque);
    }

    // Registrar movimento no caixa
    db.prepare(`
      INSERT INTO caixa_movimentos (caixa_sessao_id, tipo, valor, observacao)
      VALUES (?, 'VENDA', ?, ?)
    `).run(caixa.id, total, `Venda ${numeroVenda}`);

    return vendaId;
  });

  try {
    const vendaId = criarVenda();
    return res.status(201).json({ id: vendaId });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/vendas/:id/cancelar
router.post('/:id/cancelar', (req, res) => {
  const db = getDb();
  const venda = db.prepare('SELECT * FROM vendas WHERE id = ?').get(Number(req.params.id));
  if (!venda) return res.status(404).json({ error: 'Venda não encontrada.' });
  if (venda.status === 'CANCELADA') return res.status(400).json({ error: 'Venda já cancelada.' });

  const { motivo } = req.body;

  const cancelar = db.transaction(() => {
    db.prepare(`
      UPDATE vendas SET status = 'CANCELADA', cancelado_em = datetime('now'), motivo_cancelamento = ?
      WHERE id = ?
    `).run(motivo || null, venda.id);

    // Devolver estoque
    const itens = db.prepare('SELECT produto_id, quantidade FROM itens_venda WHERE venda_id = ?').all(venda.id);
    for (const item of itens) {
      const produto = db.prepare('SELECT estoque_atual FROM produtos WHERE id = ?').get(item.produto_id);
      const novoEstoque = produto.estoque_atual + item.quantidade;
      db.prepare('UPDATE produtos SET estoque_atual = ? WHERE id = ?').run(novoEstoque, item.produto_id);

      db.prepare(`
        INSERT INTO movimentacoes_estoque (produto_id, usuario_id, tipo, quantidade, estoque_antes, estoque_depois, motivo)
        VALUES (?, ?, 'ENTRADA', ?, ?, ?, 'Cancelamento de venda')
      `).run(item.produto_id, req.usuario.id, item.quantidade, produto.estoque_atual, novoEstoque);
    }
  });

  cancelar();
  return res.json({ ok: true });
});

module.exports = router;
