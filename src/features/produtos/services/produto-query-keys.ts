export const produtoQueryKeys = {
  all: ["produtos"] as const,
  list: (params: string) => ["produtos", "list", params] as const,
  detail: (id: number) => ["produtos", "detail", id] as const,
  categorias: ["produtos", "categorias"] as const
};
