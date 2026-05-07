import { listarCategorias as apiListarCategorias } from "@/services/api";
import { CategoriaEntity } from "@/domain/entities/produto";

export async function listCategoriasRepository(): Promise<CategoriaEntity[]> {
  return apiListarCategorias();
}
