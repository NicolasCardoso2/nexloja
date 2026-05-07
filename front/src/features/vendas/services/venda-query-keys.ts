export const vendaQueryKeys = {
  all: ["vendas"] as const,
  produtosBusca: (query: string) => ["vendas", "produtos-busca", query] as const,
  list: (params: string) => ["vendas", "list", params] as const,
  detail: (id: number) => ["vendas", "detail", id] as const
};
