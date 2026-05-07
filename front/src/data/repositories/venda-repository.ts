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
  const raws = await buscarProdutosVenda(query);
  return raws.map((raw) => vendaMapper.fromApiToProdutoVendaBusca(raw));
}

export async function createVendaRepository(payload: FinalizarVendaInput): Promise<number> {
  const result = await criarVenda({
    usuario_id: payload.usuario_id,
    cliente_id: payload.cliente_id,
    desconto: payload.desconto,
    forma_pagamento: payload.forma_pagamento,
    itens: payload.itens.map((item) => ({
      produto_id: item.produto_id,
      quantidade: item.quantidade
    }))
  });

  return result.id;
}

type ListVendasFilters = { dataInicio?: string; dataFim?: string; clienteId?: number; status?: string };

export async function listVendasRepository(filters?: ListVendasFilters): Promise<VendaListItemEntity[]> {
  const raws = await listarVendas(filters);
  return vendaMapper.fromApiListToEntities(raws);
}

export async function getVendaByIdRepository(id: number): Promise<VendaDetalheEntity> {
  const raw = await obterVenda(id);
  return vendaMapper.fromApiToDetalhe(raw);
}

export async function cancelarVendaRepository(payload: CancelarVendaInput): Promise<void> {
  await cancelarVenda(payload.venda_id);
}
