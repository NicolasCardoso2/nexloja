/**
 * Arquivo de índice para facilitar imports dos novos padrões
 * Evita imports profundos como:
 *   import { produtoMapper } from '@/domain/mappers/produto-mapper';
 * 
 * E permite:
 *   import { produtoMapper } from '@/domain';
 */

// Mappers
export { produtoMapper } from './mappers/produto-mapper';
export { clienteMapper } from './mappers/cliente-mapper';
export { vendaMapper } from './mappers/venda-mapper';
export { estoqueMapper } from './mappers/estoque-mapper';

// Errors
export {
  DomainError,
  EstoqueInsuficienteError,
  RecursoNaoEncontradoError,
  OperacaoNaoPermitidaError,
  DadosInvalidosError,
  ErroServidorError,
  isDomainError,
  mapApiErrorToDomainError,
} from './errors/domain-error';

// Rules (já existentes, apenas re-exportando)
export { validarEstoqueDisponivel } from './rules/validar-estoque-disponivel';
export { calcularTotalVenda } from './rules/calcular-total-venda';
export { cancelarVenda } from './rules/cancelar-venda';
export { validateNonNegativePrice } from './rules/price-rules';

// Entities (já existentes)
export type { ProdutoListItemEntity, ProdutoDetalheEntity, UpsertProdutoInput } from './entities/produto';
export type { ClienteListItemEntity, ClienteDetalheEntity, UpsertClienteInput, ClienteFilters, ClienteResumoComprasEntity } from './entities/cliente';
export type { VendaDetalheEntity, VendaListItemEntity, ProdutoVendaBuscaEntity, FinalizarVendaItemInput, FormaPagamento, VendaStatus } from './entities/venda';
export type { ItemVendaEntity } from './entities/item-venda';
export type { EstoqueItemEntity, MovimentacaoEstoqueEntity, RegistrarMovimentacaoInput } from './entities/movimentacao-estoque';


