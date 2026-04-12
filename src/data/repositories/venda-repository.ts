import { buscarProdutosVenda, criarVenda, listarVendas, obterVenda, cancelarVenda } from "@/services/api";
import {
  CancelarVendaInput,
  FinalizarVendaInput,
  ProdutoVendaBuscaEntity,
  VendaDetalheEntity,
  VendaListItemEntity
} from "@/domain/entities/venda";
import { vendaMapper } from "@/domain/mappers/venda-mapper";

export async function searchProdutosVendaRepository(query: string): Promise<ProdutoVendaBuscaEntity[]> {
  try {
    const raws = await buscarProdutosVenda(query);
    return raws.map(raw => vendaMapper.fromApiToProdutoVendaBusca(raw));
  } catch {
    return [];
  }
}

export async function createVendaRepository(payload: FinalizarVendaInput): Promise<number> {
  // In a real scenario, we'd fetch product prices from the API
  // For now, we'll use a default price of 0
  const itens = payload.itens.map((item) => ({
    produto_id: item.produto_id,
    quantidade: item.quantidade,
    preco_unitario: 0,
    subtotal: 0
  }));
  
  const total = itens.reduce((sum, item) => sum + item.subtotal, 0);
  
  const result = await criarVenda({
    cliente_id: payload.cliente_id,
    itens,
    total
  });
  return result.id;
}

export async function listVendasRepository(): Promise<VendaListItemEntity[]> {
  try {
    const raws = await listarVendas();
    return vendaMapper.fromApiListToEntities(raws);
  } catch {
    return [];
  }
}

export async function getVendaByIdRepository(id: number): Promise<VendaDetalheEntity> {
  const raw = await obterVenda(id);
  return vendaMapper.fromApiToDetalhe(raw);
}

export async function cancelarVendaRepository(payload: CancelarVendaInput): Promise<void> {
  await cancelarVenda(payload.venda_id);
