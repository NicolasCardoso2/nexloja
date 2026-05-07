import { z } from "zod";

export const finalizarVendaSchema = z.object({
  cliente_id: z.coerce.number().int().positive().optional(),
  desconto: z.coerce.number().min(0, "Desconto nao pode ser negativo"),
  forma_pagamento: z.enum(["DINHEIRO", "PIX", "CARTAO_DEBITO", "CARTAO_CREDITO"])
});

export type FinalizarVendaFormValues = z.infer<typeof finalizarVendaSchema>;
