import { z } from "zod";

export const aberturaCaixaSchema = z.object({
  valor_inicial: z.coerce.number().min(0, "Valor inicial deve ser maior ou igual a zero"),
  observacoes: z.string().trim().optional()
});

export type AberturaCaixaFormValues = z.infer<typeof aberturaCaixaSchema>;
