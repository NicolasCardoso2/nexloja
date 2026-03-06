import { tauriCommand } from "@/data/db/tauri-command";
import { CategoriaEntity } from "@/domain/entities/produto";

export async function listCategoriasRepository(): Promise<CategoriaEntity[]> {
  return tauriCommand<CategoriaEntity[]>("list_categories");
}
