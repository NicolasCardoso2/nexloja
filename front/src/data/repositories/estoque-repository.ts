import { listarEstoque, listarMovimentacoesEstoque, registrarMovimentacaoEstoque } from "@/services/api";
import {
  EstoqueItemEntity,
  MovimentacaoEstoqueEntity,
  ProdutoMovimentacaoOptionEntity,
  RegistrarMovimentacaoInput
} from "@/domain/entities/movimentacao-estoque";
import { estoqueMapper } from "@/domain/mappers/estoque-mapper";

type ListEstoqueFilters = {
  query?: string;
  categoriaId?: number;
  apenasEstoqueBaixo?: boolean;
};

type ListMovimentacoesFilters = {
  produtoId?: number;
};

export async function listEstoqueRepository(filters?: ListEstoqueFilters): Promise<EstoqueItemEntity[]> {
  const raws = await listarEstoque(filters);
  return estoqueMapper.fromApiListToEstoqueItems(raws);
}

export async function listProdutosMovimentacaoRepository(): Promise<ProdutoMovimentacaoOptionEntity[]> {
  const raws = await listarEstoque();
  return raws.map((raw: any) => estoqueMapper.fromApiToProdutoMovimentacao(raw));
}

export async function listMovimentacoesEstoqueRepository(filters?: ListMovimentacoesFilters): Promise<MovimentacaoEstoqueEntity[]> {
  const raws = await listarMovimentacoesEstoque(filters);
  return estoqueMapper.fromApiListToMovimentacoes(raws);
}

export async function registrarMovimentacaoEstoqueRepository(payload: RegistrarMovimentacaoInput): Promise<void> {
  await registrarMovimentacaoEstoque({
    produto_id: payload.produto_id,
    usuario_id: payload.usuario_id,
    tipo: payload.tipo,
    quantidade: payload.quantidade,
    motivo: payload.motivo,
    observacao: payload.observacao
  });
}
