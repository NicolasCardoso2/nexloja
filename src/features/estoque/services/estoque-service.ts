import {
  listEstoqueRepository,
  listMovimentacoesEstoqueRepository,
  listProdutosMovimentacaoRepository,
  registrarMovimentacaoEstoqueRepository
} from "@/data/repositories/estoque-repository";
import { EstoqueFilters, MovimentacaoFilters, RegistrarMovimentacaoInput } from "@/domain/entities/movimentacao-estoque";

export function listEstoqueService(filters: EstoqueFilters) {
  return listEstoqueRepository(filters);
}

export function listProdutosMovimentacaoService() {
  return listProdutosMovimentacaoRepository();
}

export function listMovimentacoesEstoqueService(filters: MovimentacaoFilters) {
  return listMovimentacoesEstoqueRepository(filters);
}

export function registrarMovimentacaoEstoqueService(payload: RegistrarMovimentacaoInput) {
  return registrarMovimentacaoEstoqueRepository(payload);
}
