import {
  cancelarVendaRepository,
  createVendaRepository,
  getVendaByIdRepository,
  listVendasRepository,
  searchProdutosVendaRepository
} from "@/data/repositories/venda-repository";
import { 
  CancelarVendaInput, 
  FinalizarVendaInput,
  VendaListItemEntity,
  VendaDetalheEntity,
  ProdutoVendaBuscaEntity
} from "@/domain/entities/venda";
import { 
  DadosInvalidosError,
  OperacaoNaoPermitidaError
} from "@/domain/errors/domain-error";
import { calcularTotalVenda } from "@/domain/rules/calcular-total-venda";

/**
 * Service para buscar produtos para venda
 * Filtra apenas produtos ativos e com estoque
 */
export async function searchProdutosVendaService(query: string): Promise<ProdutoVendaBuscaEntity[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const produtos = await searchProdutosVendaRepository(query);
  
  // Filtrar apenas produtos ativos e com estoque
  return produtos.filter(p => p.ativo && p.estoque_atual > 0);
}

/**
 * Service para criar uma venda
 * Valida regras de negócio antes de persistir
 */
export async function createVendaService(payload: FinalizarVendaInput): Promise<number> {
  // Validar itens não vazios
  if (!payload.itens || payload.itens.length === 0) {
    throw new DadosInvalidosError('itens', 'Venda deve ter pelo menos um item');
  }

  // Validar desconto não negativo
  if (payload.desconto < 0) {
    throw new DadosInvalidosError('desconto', 'Desconto não pode ser negativo');
  }

  // Validar forma de pagamento
  const formasPagamentoValidas = ['DINHEIRO', 'PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO'];
  if (!formasPagamentoValidas.includes(payload.forma_pagamento)) {
    throw new DadosInvalidosError('forma_pagamento', 'Forma de pagamento inválida');
  }

  // TODO: Validar estoque e preços dos produtos
  // Isso seria feito aqui: buscar produtos e validar estoque e preços

  return await createVendaRepository(payload);
}

/**
 * Service para listar vendas
 */
export async function listVendasService(): Promise<VendaListItemEntity[]> {
  return await listVendasRepository();
}

/**
 * Service para obter detalhes de uma venda
 */
export async function getVendaByIdService(id: number): Promise<VendaDetalheEntity> {
  return await getVendaByIdRepository(id);
}

/**
 * Service para cancelar uma venda
 * Valida estado da venda antes de cancelar
 */
export async function cancelarVendaService(payload: CancelarVendaInput): Promise<void> {
  // Buscar venda para validar status
  const venda = await getVendaByIdRepository(payload.venda_id);

  // Validar se venda pode ser cancelada
  if (venda.status === 'CANCELADA') {
    throw new OperacaoNaoPermitidaError('Venda já foi cancelada anteriormente');
  }

  // Executar cancelamento
  return await cancelarVendaRepository(payload);
}
