import {
  listEstoqueRepository,
  listMovimentacoesEstoqueRepository,
  listProdutosMovimentacaoRepository,
  registrarMovimentacaoEstoqueRepository
} from "@/data/repositories/estoque-repository";
import { toEstoqueFilters, toMovimentacaoFilters, EstoqueListState } from "@/features/estoque/types/estoque-filters";
import { 
  EstoqueItemEntity,
  MovimentacaoEstoqueEntity,
  ProdutoMovimentacaoOptionEntity,
  RegistrarMovimentacaoInput 
} from "@/domain/entities/movimentacao-estoque";
import { DadosInvalidosError } from "@/domain/errors/domain-error";

/**
 * Service para listar itens de estoque
 */
export async function listEstoqueService(filtersState?: EstoqueListState): Promise<EstoqueItemEntity[]> {
  const filters = filtersState ? toEstoqueFilters(filtersState) : undefined;
  return await listEstoqueRepository(filters);
}

/**
 * Service para listar produtos para movimentação
 * Apenas produtos ativos
 */
export async function listProdutosMovimentacaoService(): Promise<ProdutoMovimentacaoOptionEntity[]> {
  const produtos = await listProdutosMovimentacaoRepository();
  return produtos.filter(p => p.ativo);
}

/**
 * Service para listar movimentações do estoque
 */
export async function listMovimentacoesEstoqueService(filtersState?: EstoqueListState): Promise<MovimentacaoEstoqueEntity[]> {
  const filters = filtersState ? toMovimentacaoFilters(filtersState) : undefined;
  return await listMovimentacoesEstoqueRepository(filters);
}

/**
 * Service para registrar movimentação de estoque
 * Valida regras antes de persistir
 */
export async function registrarMovimentacaoEstoqueService(payload: RegistrarMovimentacaoInput): Promise<void> {
  // Validar produto_id
  if (!payload.produto_id || payload.produto_id < 1) {
    throw new DadosInvalidosError('produto_id', 'Produto inválido');
  }

  // Validar tipo
  const tiposValidos = ['ENTRADA', 'SAIDA', 'AJUSTE'];
  if (!tiposValidos.includes(payload.tipo)) {
    throw new DadosInvalidosError('tipo', 'Tipo de movimentação inválido');
  }

  // Validar quantidade (deve ser número positivo)
  if (!payload.quantidade || payload.quantidade <= 0) {
    throw new DadosInvalidosError('quantidade', 'Quantidade deve ser maior que zero');
  }

  // Validar motivo/observação
  if (!payload.observacao || payload.observacao.trim().length === 0) {
    throw new DadosInvalidosError('observacao', 'Motivo da movimentação é obrigatório');
  }

  // Persistir
  return await registrarMovimentacaoEstoqueRepository(payload);
}
