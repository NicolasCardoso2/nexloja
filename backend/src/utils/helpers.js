/**
 * Gera um número de venda único no formato VD{YYYYMMDD}{NNNN}
 * Ex: VD202605050001
 */
function gerarNumeroVenda(db) {
  const hoje = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = db.prepare(
    `SELECT COUNT(*) as c FROM vendas WHERE numero_venda LIKE ?`
  ).get(`VD${hoje}%`);
  const seq = String(count.c + 1).padStart(4, '0');
  return `VD${hoje}${seq}`;
}

module.exports = { gerarNumeroVenda };
