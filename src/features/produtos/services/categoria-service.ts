import { listCategoriasRepository } from "@/data/repositories/categoria-repository";

export function listCategoriasService() {
  return listCategoriasRepository();
}
