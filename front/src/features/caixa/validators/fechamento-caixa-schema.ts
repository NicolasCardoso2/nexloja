import { z } from "zod";

export const fechamentoCaixaSchema = z.object({
  valor_final_informado: z.coerce.number().min(0, "Valor final informado deve ser maior ou igual a zero"),
  observacoes: z.string().trim().optional()
});

export type FechamentoCaixaFormValues = z.infer<typeof fechamentoCaixaSchema>;
