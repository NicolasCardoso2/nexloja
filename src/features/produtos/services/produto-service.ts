import {
  createProdutoRepository,
  deactivateProdutoRepository,
  getProdutoByIdRepository,
  listProdutosRepository,
  updateProdutoRepository
} from "@/data/repositories/produto-repository";
import { ProdutoFilters, UpsertProdutoInput } from "@/domain/entities/produto";

export function listProdutosService(filters: ProdutoFilters) {
  return listProdutosRepository(filters);
}

export function getProdutoByIdService(id: number) {
  return getProdutoByIdRepository(id);
}

export function createProdutoService(payload: UpsertProdutoInput) {
  return createProdutoRepository(payload);
}

export function updateProdutoService(id: number, payload: UpsertProdutoInput) {
  return updateProdutoRepository(id, payload);
}

export function deactivateProdutoService(id: number) {
  return deactivateProdutoRepository(id);
}
