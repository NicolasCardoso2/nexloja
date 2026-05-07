export const clienteQueryKeys = {
  all: ["clientes"] as const,
  list: (params: string) => ["clientes", "list", params] as const,
  detail: (id: number) => ["clientes", "detail", id] as const
};
