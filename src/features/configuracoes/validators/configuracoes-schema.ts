import { z } from "zod";

export const configuracoesSchema = z.object({
  nome_loja: z.string().trim().min(1, "Nome da loja e obrigatorio"),
  cnpj: z.string().trim().optional(),
  telefone: z.string().trim().optional(),
  email: z.string().trim().email("Email invalido").or(z.literal("")).optional(),
  endereco: z.string().trim().optional(),
  logo_path: z.string().trim().optional(),
  tema: z.enum(["light", "dark"]),
  moeda: z.string().trim().min(1, "Moeda e obrigatoria")
});

export type ConfiguracoesFormValues = z.infer<typeof configuracoesSchema>;
