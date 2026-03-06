export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  resumo: (usuarioId: number) => ["dashboard", "resumo", usuarioId] as const
};
