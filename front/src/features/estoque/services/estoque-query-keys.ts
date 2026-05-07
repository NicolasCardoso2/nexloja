export const estoqueQueryKeys = {
  all: ["estoque"] as const,
  list: (params: string) => ["estoque", "list", params] as const,
  produtosMovimentacao: ["estoque", "produtos-movimentacao"] as const,
  movimentacoes: (params: string) => ["estoque", "movimentacoes", params] as const
};
