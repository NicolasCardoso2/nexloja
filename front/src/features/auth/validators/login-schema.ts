import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1, "Informe o login"),
  senha: z.string().min(1, "Informe a senha")
});

export type LoginSchema = z.infer<typeof loginSchema>;
