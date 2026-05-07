export const caixaQueryKeys = {
  all: ["caixa"] as const,
  sessaoAtual: (usuarioId: number) => ["caixa", "sessao-atual", usuarioId] as const,
  movimentos: (sessaoId: number) => ["caixa", "movimentos", sessaoId] as const
};
