const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/dashboard/resumo
router.get('/resumo', (req, res) => {
  const db = getDb();
  const hoje = new Date().toISOString().slice(0, 10);

  const vendasHoje = db.prepare(`
    SELECT
      COALESCE(SUM(total), 0) AS total_vendido_dia,
      COUNT(*) AS quantidade_vendas_dia,
      COALESCE(AVG(total), 0) AS ticket_medio_dia
    FROM vendas
    WHERE date(criado_em) = ? AND status = 'FINALIZADA'
  `).get(hoje);

  const metaDiaria = (() => {
    // Compatibilidade com bancos antigos sem a coluna meta_diaria.
    try {
      const configuracao = db.prepare(`
        SELECT meta_diaria FROM configuracao_loja LIMIT 1
      `).get();
      return Number(configuracao?.meta_diaria ?? 0);
    } catch (_) {
      return 0;
    }
  })();
  const progressoMetaDiariaPct = metaDiaria > 0
    ? Math.round((Number(vendasHoje.total_vendido_dia) / metaDiaria) * 100)
    : null;

  const estoqueBaixo = db.prepare(`
    SELECT COUNT(*) AS c FROM produtos
    WHERE ativo = 1 AND estoque_atual > 0 AND estoque_atual <= estoque_minimo
  `).get();

  const estoqueZerado = db.prepare(`
    SELECT COUNT(*) AS c FROM produtos WHERE ativo = 1 AND estoque_atual = 0
  `).get();

  const caixaSessao = db.prepare(`
    SELECT * FROM caixa_sessoes WHERE status = 'ABERTO' ORDER BY aberto_em DESC LIMIT 1
  `).get();

  let caixaAtual;
  if (caixaSessao) {
    const totalMov = db.prepare(`
      SELECT COALESCE(SUM(valor), 0) AS total FROM caixa_movimentos WHERE caixa_sessao_id = ?
    `).get(caixaSessao.id);
    caixaAtual = {
      status: 'ABERTO',
      aberto_em: caixaSessao.aberto_em,
      valor_inicial: caixaSessao.valor_abertura,
      valor_movimentado: totalMov.total
    };
  } else {
    caixaAtual = { status: 'SEM_SESSAO', aberto_em: null, valor_inicial: null, valor_movimentado: 0 };
  }

  const ultimasVendas = db.prepare(`
    SELECT
      v.numero_venda, v.criado_em,
      c.nome AS cliente_nome,
      v.total, v.forma_pagamento, v.status
    FROM vendas v
    LEFT JOIN clientes c ON c.id = v.cliente_id
    ORDER BY v.criado_em DESC LIMIT 5
  `).all();

  const maisVendidos = db.prepare(`
    SELECT
      p.nome AS produto_nome,
      SUM(iv.quantidade) AS quantidade_vendida,
      SUM(iv.subtotal) AS total_vendido
    FROM itens_venda iv
    JOIN vendas v ON v.id = iv.venda_id
    JOIN produtos p ON p.id = iv.produto_id
    WHERE v.status = 'FINALIZADA'
    GROUP BY iv.produto_id
    ORDER BY quantidade_vendida DESC LIMIT 5
  `).all();

  return res.json({
    total_vendido_dia: vendasHoje.total_vendido_dia,
    quantidade_vendas_dia: vendasHoje.quantidade_vendas_dia,
    ticket_medio_dia: vendasHoje.ticket_medio_dia,
    meta_diaria: metaDiaria,
    progresso_meta_diaria_pct: progressoMetaDiariaPct,
    produtos_estoque_baixo: estoqueBaixo.c,
    produtos_zerados: estoqueZerado.c,
    caixa_atual: caixaAtual,
    ultimas_vendas: ultimasVendas,
    produtos_mais_vendidos: maisVendidos
  });
});

module.exports = router;
