const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/relatorios/vendas
router.get('/vendas', (req, res) => {
  const { dataInicio, dataFim, clienteId, status, formaPagamento } = req.query;

  const where = [];
  const params = [];

  if (dataInicio) { where.push('date(v.criado_em) >= ?'); params.push(dataInicio); }
  if (dataFim) { where.push('date(v.criado_em) <= ?'); params.push(dataFim); }
  if (clienteId) { where.push('v.cliente_id = ?'); params.push(Number(clienteId)); }
  if (status) { where.push('v.status = ?'); params.push(status); }
  if (formaPagamento) { where.push('v.forma_pagamento = ?'); params.push(formaPagamento); }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const db = getDb();
  const itens = db.prepare(`
    SELECT
      v.numero_venda, v.criado_em,
      c.nome AS cliente_nome,
      u.nome AS usuario_nome,
      v.forma_pagamento, v.subtotal, v.desconto, v.total, v.status
    FROM vendas v
    LEFT JOIN clientes c ON c.id = v.cliente_id
    LEFT JOIN usuarios u ON u.id = v.usuario_id
    ${whereClause}
    ORDER BY v.criado_em DESC
  `).all(...params);

  const resumoWhere = where.length > 0 ? where.join(' AND ').replace(/v\./g, 'v.') : '1=1';
  const resumo = db.prepare(`
    SELECT
      COUNT(*) AS quantidade_vendas,
      COALESCE(SUM(CASE WHEN v.status = 'FINALIZADA' THEN v.total ELSE 0 END), 0) AS total_vendido_finalizadas,
      COALESCE(SUM(CASE WHEN v.status = 'FINALIZADA' THEN v.desconto ELSE 0 END), 0) AS total_descontos_finalizadas,
      COALESCE(AVG(CASE WHEN v.status = 'FINALIZADA' THEN v.total END), 0) AS ticket_medio_finalizadas
    FROM vendas v
    LEFT JOIN clientes c ON c.id = v.cliente_id
    ${whereClause}
  `).get(...params);

  return res.json({ itens, resumo });
});

// GET /api/relatorios/produtos
router.get('/produtos', (req, res) => {
  const { dataInicio, dataFim, categoriaId } = req.query;

  const vendaWhere = [];
  const params = [];

  if (dataInicio) { vendaWhere.push('date(v.criado_em) >= ?'); params.push(dataInicio); }
  if (dataFim) { vendaWhere.push('date(v.criado_em) <= ?'); params.push(dataFim); }
  if (categoriaId) { vendaWhere.push('p.categoria_id = ?'); params.push(Number(categoriaId)); }

  const vendaJoinFilter = vendaWhere.length > 0
    ? `AND v.status = 'FINALIZADA' AND ${vendaWhere.join(' AND ')}`
    : `AND v.status = 'FINALIZADA'`;

  const db = getDb();
  const produtos = db.prepare(`
    SELECT
      p.nome AS produto_nome,
      p.codigo AS produto_codigo,
      c.nome AS categoria_nome,
      COALESCE(SUM(iv.quantidade), 0) AS quantidade_vendida,
      COALESCE(SUM(iv.subtotal), 0) AS total_vendido,
      COALESCE(AVG(iv.preco_unitario), 0) AS preco_medio_praticado
    FROM produtos p
    LEFT JOIN categorias c ON c.id = p.categoria_id
    LEFT JOIN itens_venda iv ON iv.produto_id = p.id
    LEFT JOIN vendas v ON v.id = iv.venda_id ${vendaJoinFilter}
    ${categoriaId ? 'WHERE p.categoria_id = ?' : ''}
    GROUP BY p.id
    ORDER BY quantidade_vendida DESC
  `).all(...(categoriaId ? [...params, Number(categoriaId)] : params));

  return res.json(produtos);
});

// GET /api/relatorios/lucro
// Lucro real por produto e categoria (faturamento - custo)
router.get('/lucro', (req, res) => {
  const db = getDb();
  const { dataInicio, dataFim, categoriaId } = req.query;

  let where = "WHERE v.status = 'FINALIZADA'";
  const params = [];
  if (dataInicio) { where += " AND date(v.criado_em) >= ?"; params.push(dataInicio); }
  if (dataFim)    { where += " AND date(v.criado_em) <= ?"; params.push(dataFim); }
  if (categoriaId) { where += " AND p.categoria_id = ?"; params.push(Number(categoriaId)); }

  const porProduto = db.prepare(`
    SELECT
      p.nome AS produto_nome,
      p.codigo AS produto_codigo,
      c.nome AS categoria_nome,
      p.preco_custo,
      COALESCE(SUM(iv.quantidade), 0) AS quantidade_vendida,
      COALESCE(SUM(iv.subtotal), 0) AS total_faturado,
      COALESCE(SUM(iv.quantidade * p.preco_custo), 0) AS total_custo,
      COALESCE(SUM(iv.subtotal) - SUM(iv.quantidade * p.preco_custo), 0) AS lucro,
      CASE
        WHEN COALESCE(SUM(iv.subtotal), 0) > 0
        THEN ROUND((COALESCE(SUM(iv.subtotal) - SUM(iv.quantidade * p.preco_custo), 0) / SUM(iv.subtotal)) * 100, 2)
        ELSE 0
      END AS margem_pct
    FROM produtos p
    LEFT JOIN categorias c ON c.id = p.categoria_id
    LEFT JOIN itens_venda iv ON iv.produto_id = p.id
    LEFT JOIN vendas v ON v.id = iv.venda_id
    ${where.replace("WHERE v.status", "WHERE iv.id IS NOT NULL AND v.status")}
    GROUP BY p.id
    ORDER BY lucro DESC
  `).all(...params);

  const porCategoria = db.prepare(`
    SELECT
      c.nome AS categoria_nome,
      COALESCE(SUM(iv.subtotal), 0) AS total_faturado,
      COALESCE(SUM(iv.quantidade * p.preco_custo), 0) AS total_custo,
      COALESCE(SUM(iv.subtotal) - SUM(iv.quantidade * p.preco_custo), 0) AS lucro,
      CASE
        WHEN COALESCE(SUM(iv.subtotal), 0) > 0
        THEN ROUND((COALESCE(SUM(iv.subtotal) - SUM(iv.quantidade * p.preco_custo), 0) / SUM(iv.subtotal)) * 100, 2)
        ELSE 0
      END AS margem_pct
    FROM itens_venda iv
    JOIN vendas v ON v.id = iv.venda_id
    JOIN produtos p ON p.id = iv.produto_id
    JOIN categorias c ON c.id = p.categoria_id
    ${where}
    GROUP BY c.id
    ORDER BY lucro DESC
  `).all(...params);

  const resumo = db.prepare(`
    SELECT
      COALESCE(SUM(iv.subtotal), 0) AS total_faturado,
      COALESCE(SUM(iv.quantidade * p.preco_custo), 0) AS total_custo,
      COALESCE(SUM(iv.subtotal) - SUM(iv.quantidade * p.preco_custo), 0) AS lucro_bruto,
      CASE
        WHEN COALESCE(SUM(iv.subtotal), 0) > 0
        THEN ROUND((COALESCE(SUM(iv.subtotal) - SUM(iv.quantidade * p.preco_custo), 0) / SUM(iv.subtotal)) * 100, 2)
        ELSE 0
      END AS margem_media_pct
    FROM itens_venda iv
    JOIN vendas v ON v.id = iv.venda_id
    JOIN produtos p ON p.id = iv.produto_id
    ${where}
  `).get(...params);

  return res.json({ resumo, por_produto: porProduto, por_categoria: porCategoria });
});

// GET /api/relatorios/curva-abc
// Classifica produtos por contribuição de receita: A=80%, B=15%, C=5%
router.get('/curva-abc', (req, res) => {
  const db = getDb();
  const { dataInicio, dataFim } = req.query;

  let where = "WHERE v.status = 'FINALIZADA'";
  const params = [];
  if (dataInicio) { where += " AND date(v.criado_em) >= ?"; params.push(dataInicio); }
  if (dataFim)    { where += " AND date(v.criado_em) <= ?"; params.push(dataFim); }

  const produtos = db.prepare(`
    SELECT
      p.nome AS produto_nome,
      p.codigo AS produto_codigo,
      c.nome AS categoria_nome,
      COALESCE(SUM(iv.quantidade), 0) AS quantidade_vendida,
      COALESCE(SUM(iv.subtotal), 0) AS total_faturado
    FROM produtos p
    LEFT JOIN categorias c ON c.id = p.categoria_id
    LEFT JOIN itens_venda iv ON iv.produto_id = p.id
    LEFT JOIN vendas v ON v.id = iv.venda_id
    ${where.replace("WHERE v.status", "WHERE iv.id IS NOT NULL AND v.status")}
    GROUP BY p.id
    ORDER BY total_faturado DESC
  `).all(...params);

  const totalGeral = produtos.reduce((acc, p) => acc + p.total_faturado, 0);
  let acumulado = 0;
  const result = produtos.map((p) => {
    acumulado += p.total_faturado;
    const pct_acumulado = totalGeral > 0 ? (acumulado / totalGeral) * 100 : 0;
    const pct_produto = totalGeral > 0 ? (p.total_faturado / totalGeral) * 100 : 0;
    const classe = pct_acumulado <= 80 ? 'A' : pct_acumulado <= 95 ? 'B' : 'C';
    return { ...p, pct_produto: Math.round(pct_produto * 100) / 100, pct_acumulado: Math.round(pct_acumulado * 100) / 100, classe };
  });

  const resumo = {
    total_faturado: totalGeral,
    classe_a: result.filter(p => p.classe === 'A').length,
    classe_b: result.filter(p => p.classe === 'B').length,
    classe_c: result.filter(p => p.classe === 'C').length,
  };

  return res.json({ resumo, itens: result });
});

// GET /api/relatorios/reposicao
// Sugestão de compra baseada em estoque e velocidade de vendas dos últimos 30 dias
router.get('/reposicao', (req, res) => {
  const db = getDb();
  const JANELA_DIAS = 30;
  const COBERTURA_ALVO_DIAS = 30;

  const itens = db.prepare(`
    SELECT
      p.id,
      p.codigo,
      p.nome AS produto_nome,
      c.nome AS categoria_nome,
      p.estoque_atual,
      p.estoque_minimo,
      p.preco_custo,
      COALESCE(SUM(iv.quantidade), 0) AS vendido_30d
    FROM produtos p
    LEFT JOIN categorias c ON c.id = p.categoria_id
    LEFT JOIN itens_venda iv ON iv.produto_id = p.id
    LEFT JOIN vendas v ON v.id = iv.venda_id
      AND v.status = 'FINALIZADA'
      AND date(v.criado_em) >= date('now', '-${JANELA_DIAS} days')
    WHERE p.ativo = 1
    GROUP BY p.id
    ORDER BY p.estoque_atual ASC
  `).all();

  const result = itens.map((p) => {
    const velocidade_dia = p.vendido_30d / JANELA_DIAS;
    const dias_cobertura = velocidade_dia > 0 ? Math.floor(p.estoque_atual / velocidade_dia) : null;
    const quantidade_sugerida = Math.max(0, Math.ceil(velocidade_dia * COBERTURA_ALVO_DIAS) - p.estoque_atual);
    const alerta = p.estoque_atual <= p.estoque_minimo || (dias_cobertura !== null && dias_cobertura <= 7);
    return {
      ...p,
      velocidade_dia: Math.round(velocidade_dia * 100) / 100,
      dias_cobertura,
      quantidade_sugerida,
      custo_reposicao: Math.round(quantidade_sugerida * p.preco_custo * 100) / 100,
      alerta
    };
  }).filter(p => p.alerta || p.estoque_atual <= p.estoque_minimo * 1.5);

  const custo_total_sugerido = result.reduce((acc, p) => acc + p.custo_reposicao, 0);

  return res.json({ custo_total_sugerido: Math.round(custo_total_sugerido * 100) / 100, itens: result });
});

// GET /api/relatorios/sazonalidade
// Vendas agrupadas por semana dos últimos 90 dias para identificar padrões
router.get('/sazonalidade', (req, res) => {
  const db = getDb();

  const semanas = db.prepare(`
    SELECT
      strftime('%Y-W%W', criado_em) AS semana,
      MIN(date(criado_em)) AS inicio_semana,
      COUNT(*) AS quantidade_vendas,
      COALESCE(SUM(total), 0) AS total_vendido,
      COALESCE(AVG(total), 0) AS ticket_medio
    FROM vendas
    WHERE status = 'FINALIZADA'
      AND date(criado_em) >= date('now', '-90 days')
    GROUP BY semana
    ORDER BY semana ASC
  `).all();

  const media_semanal = semanas.length > 0
    ? semanas.reduce((acc, s) => acc + s.total_vendido, 0) / semanas.length
    : 0;

  const result = semanas.map((s) => ({
    ...s,
    acima_media: s.total_vendido > media_semanal
  }));

  return res.json({ media_semanal: Math.round(media_semanal * 100) / 100, semanas: result });
});

// GET /api/relatorios/saude
// Indicadores de saúde do negócio: margem, ticket, metas
router.get('/saude', (req, res) => {
  const db = getDb();
  const hoje = new Date().toISOString().slice(0, 10);
  const inicioMes = hoje.slice(0, 7) + '-01';
  const inicioSemana = (() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10);
  })();

  const metaDiaria = (() => {
    // Compatibilidade com bancos antigos sem a coluna meta_diaria.
    try {
      const cfg = db.prepare("SELECT meta_diaria FROM configuracao_loja LIMIT 1").get();
      return Number(cfg?.meta_diaria ?? 0);
    } catch (_) {
      return 0;
    }
  })();

  const dia = db.prepare(`
    SELECT COALESCE(SUM(total),0) AS faturado, COUNT(*) AS vendas, COALESCE(AVG(total),0) AS ticket
    FROM vendas WHERE status='FINALIZADA' AND date(criado_em)=?
  `).get(hoje);

  const semana = db.prepare(`
    SELECT COALESCE(SUM(total),0) AS faturado, COUNT(*) AS vendas
    FROM vendas WHERE status='FINALIZADA' AND date(criado_em)>=?
  `).get(inicioSemana);

  const mes = db.prepare(`
    SELECT COALESCE(SUM(total),0) AS faturado, COUNT(*) AS vendas, COALESCE(AVG(total),0) AS ticket
    FROM vendas WHERE status='FINALIZADA' AND date(criado_em)>=?
  `).get(inicioMes);

  const margem = db.prepare(`
    SELECT
      CASE WHEN SUM(iv.subtotal) > 0
        THEN ROUND((SUM(iv.subtotal - iv.quantidade*p.preco_custo) / SUM(iv.subtotal))*100, 2)
        ELSE 0 END AS margem_media_pct
    FROM itens_venda iv
    JOIN vendas v ON v.id=iv.venda_id
    JOIN produtos p ON p.id=iv.produto_id
    WHERE v.status='FINALIZADA' AND date(v.criado_em)>=?
  `).get(inicioMes);

  return res.json({
    meta_diaria: metaDiaria,
    dia: { faturado: dia.faturado, vendas: dia.vendas, ticket: dia.ticket, pct_meta: metaDiaria > 0 ? Math.round((dia.faturado / metaDiaria) * 100) : null },
    semana: { faturado: semana.faturado, vendas: semana.vendas },
    mes: { faturado: mes.faturado, vendas: mes.vendas, ticket: mes.ticket },
    margem_media_mes_pct: margem.margem_media_pct
  });
});

module.exports = router;
