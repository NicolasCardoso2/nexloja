export type RelatorioAba = "VENDAS" | "MAIS_VENDIDOS" | "ESTOQUE_ATUAL" | "ESTOQUE_BAIXO";

export const relatorioAbas: Array<{ id: RelatorioAba; label: string }> = [
  { id: "VENDAS", label: "Vendas por periodo" },
  { id: "MAIS_VENDIDOS", label: "Produtos mais vendidos" },
  { id: "ESTOQUE_ATUAL", label: "Estoque atual" },
  { id: "ESTOQUE_BAIXO", label: "Estoque baixo" }
];
