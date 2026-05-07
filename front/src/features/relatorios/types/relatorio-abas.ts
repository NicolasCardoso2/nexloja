export type RelatorioAba = "VENDAS" | "MAIS_VENDIDOS" | "ESTOQUE_ATUAL" | "ESTOQUE_BAIXO" | "LUCRO" | "CURVA_ABC" | "REPOSICAO" | "SAZONALIDADE" | "SAUDE";

export const relatorioAbas: Array<{ id: RelatorioAba; label: string }> = [
  { id: "SAUDE", label: "Saude do negocio" },
  { id: "LUCRO", label: "Lucro real" },
  { id: "CURVA_ABC", label: "Curva ABC" },
  { id: "REPOSICAO", label: "Reposicao inteligente" },
  { id: "SAZONALIDADE", label: "Sazonalidade" },
  { id: "VENDAS", label: "Vendas por periodo" },
  { id: "MAIS_VENDIDOS", label: "Produtos mais vendidos" },
  { id: "ESTOQUE_ATUAL", label: "Estoque atual" },
  { id: "ESTOQUE_BAIXO", label: "Estoque baixo" },
];
