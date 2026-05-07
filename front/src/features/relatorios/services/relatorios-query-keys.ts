export const relatoriosQueryKeys = {
  all: ["relatorios"] as const,
  vendas: (params: string) => ["relatorios", "vendas", params] as const,
  produtosMaisVendidos: (params: string) => ["relatorios", "produtos-mais-vendidos", params] as const,
  estoqueAtual: (params: string) => ["relatorios", "estoque-atual", params] as const,
  estoqueBaixo: (params: string) => ["relatorios", "estoque-baixo", params] as const,
  lucro: (params: string) => ["relatorios", "lucro", params] as const,
  curvaAbc: (params: string) => ["relatorios", "curva-abc", params] as const,
  reposicao: () => ["relatorios", "reposicao"] as const,
  sazonalidade: () => ["relatorios", "sazonalidade"] as const,
  saude: () => ["relatorios", "saude"] as const,
};
