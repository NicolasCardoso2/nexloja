import { listarEstoque, listarMovimentacoesEstoque, registrarMovimentacaoEstoque } from "@/services/api";
import {
  EstoqueItemEntity,
  MovimentacaoEstoqueEntity,
  ProdutoMovimentacaoOptionEntity,
  RegistrarMovimentacaoInput
} from "@/domain/entities/movimentacao-estoque";
import { estoqueMapper } from "@/domain/mappers/estoque-mapper";

export async function listEstoqueRepository(): Promise<EstoqueItemEntity[]> {
  try {
    const raws = await listarEstoque();
    return estoqueMapper.fromApiListToEstoqueItems(raws);
  } catch {
    return [];
  }
}

export async function listProdutosMovimentacaoRepository(): Promise<ProdutoMovimentacaoOptionEntity[]> {
  try {
    const raws = await listarEstoque();
    return raws.map((raw: any) => estoqueMapper.fromApiToProdutoMovimentacao(raw));
  } catch {
    return [];
  }
}

export async function listMovimentacoesEstoqueRepository(): Promise<MovimentacaoEstoqueEntity[]> {
  try {
    const raws = await listarMovimentacoesEstoque();
    return estoqueMapper.fromApiListToMovimentacoes(raws);
  } catch {
    return [];
  }
}

export async function registrarMovimentacaoEstoqueRepository(payload: RegistrarMovimentacaoInput): Promise<void> {
  await registrarMovimentacaoEstoque({
    produto_id: payload.produto_id,
    tipo: payload.tipo,
    quantidade: payload.quantidade,
    observacao: payload.observacao
  });
}
