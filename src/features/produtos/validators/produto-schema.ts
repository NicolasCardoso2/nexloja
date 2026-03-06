import { z } from "zod";

export const produtoSchema = z.object({
  codigo: z.string().trim().min(1, "Codigo e obrigatorio"),
  nome: z.string().trim().min(1, "Nome e obrigatorio"),
  categoria_id: z.coerce.number().int().positive("Categoria e obrigatoria"),
  preco_venda: z.coerce.number().min(0, "Preco de venda nao pode ser negativo"),
  estoque_atual: z.coerce.number().min(0, "Estoque atual nao pode ser negativo"),
  estoque_minimo: z.coerce.number().min(0, "Estoque minimo nao pode ser negativo"),
  ativo: z.boolean(),
  codigo_barras: z.string().trim().optional(),
  descricao: z.string().trim().optional(),
  marca: z.string().trim().optional(),
  preco_custo: z.coerce.number().min(0, "Preco de custo nao pode ser negativo").optional(),
  unidade: z.string().trim().optional(),
  imagem_path: z.string().trim().optional()
});

export type ProdutoFormValues = z.infer<typeof produtoSchema>;
