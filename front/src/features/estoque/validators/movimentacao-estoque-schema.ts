import { z } from "zod";

export const movimentacaoEstoqueSchema = z.object({
  produto_id: z.coerce.number().int().positive("Produto e obrigatorio"),
  tipo: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]),
  quantidade: z.coerce.number().gt(0, "Quantidade deve ser maior que zero"),
  motivo: z.string().trim().min(1, "Motivo e obrigatorio"),
  observacao: z.string().trim().optional()
});

export type MovimentacaoEstoqueFormValues = z.infer<typeof movimentacaoEstoqueSchema>;
