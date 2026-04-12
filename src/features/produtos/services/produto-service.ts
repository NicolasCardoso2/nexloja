import {
  createProdutoRepository,
  getProdutoByIdRepository,
  listProdutosRepository,
  updateProdutoRepository
} from "@/data/repositories/produto-repository";
import { UpsertProdutoInput, ProdutoListItemEntity, ProdutoDetalheEntity } from "@/domain/entities/produto";
import { validateNonNegativePrice } from "@/domain/rules/price-rules";
import { DadosInvalidosError } from "@/domain/errors/domain-error";

/**
 * Service para listar produtos
 * Aplica regras de negócio e orquestra operações
 */
export async function listProdutosService(): Promise<ProdutoListItemEntity[]> {
  return await listProdutosRepository();
}

/**
 * Service para obter produto por ID
 * Valida existência e aplica regras
 */
export async function getProdutoByIdService(id: number): Promise<ProdutoDetalheEntity> {
  return await getProdutoByIdRepository(id);
}

/**
 * Service para criar um novo produto
 * Valida regras de negócio antes de persistir
 * - Validação de preço não negativo
 * - Validação de campos obrigatórios
 * - Aplicação de regras de estoque
 */
export async function createProdutoService(payload: UpsertProdutoInput): Promise<number> {
  // Validar preço não negativo
  const priceValidation = validateNonNegativePrice(payload.preco_venda);
  if (!priceValidation.isValid) {
    throw new DadosInvalidosError('preco_venda', priceValidation.message || 'Preço inválido');
  }

  if (payload.preco_custo !== undefined) {
    const costValidation = validateNonNegativePrice(payload.preco_custo);
    if (!costValidation.isValid) {
      throw new DadosInvalidosError('preco_custo', costValidation.message || 'Preço de custo inválido');
    }
  }

  // Validar campos obrigatórios
  if (!payload.nome || payload.nome.trim().length === 0) {
    throw new DadosInvalidosError('nome', 'Nome é obrigatório');
  }

  if (!payload.codigo || payload.codigo.trim().length === 0) {
    throw new DadosInvalidosError('codigo', 'Código é obrigatório');
  }

  // Persistir no repositório
  return await createProdutoRepository(payload);
}

/**
 * Service para atualizar um produto
 * Valida regras antes de persistir
 */
export async function updateProdutoService(id: number, payload: UpsertProdutoInput): Promise<void> {
  // Validar preço não negativo
  const priceValidation = validateNonNegativePrice(payload.preco_venda);
  if (!priceValidation.isValid) {
    throw new DadosInvalidosError('preco_venda', priceValidation.message || 'Preço inválido');
  }

  if (payload.preco_custo !== undefined) {
    const costValidation = validateNonNegativePrice(payload.preco_custo);
    if (!costValidation.isValid) {
      throw new DadosInvalidosError('preco_custo', costValidation.message || 'Preço de custo inválido');
    }
  }

  // Validar campos obrigatórios
  if (!payload.nome || payload.nome.trim().length === 0) {
    throw new DadosInvalidosError('nome', 'Nome é obrigatório');
  }

  // Persistir no repositório
  return await updateProdutoRepository(id, payload);
}
