import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome e obrigatorio"),
  cpf: z.string().trim().optional(),
  telefone: z.string().trim().optional(),
  email: z.string().trim().email("Email invalido").or(z.literal("")).optional(),
  endereco: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
  ativo: z.boolean()
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
