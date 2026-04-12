import {
  listarProdutos as apiListarProdutos,
  obterProduto as apiObterProduto,
  criarProduto as apiCriarProduto,
  atualizarProduto as apiAtualizarProduto,
} from "@/services/api";
import {
  ProdutoDetalheEntity,
  ProdutoListItemEntity,
  UpsertProdutoInput
} from "@/domain/entities/produto";
import { produtoMapper } from "@/domain/mappers/produto-mapper";

export async function listProdutosRepository(): Promise<ProdutoListItemEntity[]> {
  const produtos = await apiListarProdutos();
  return produtoMapper.fromApiListToEntities(produtos);
}

export async function getProdutoByIdRepository(id: number): Promise<ProdutoDetalheEntity> {
  const produto = await apiObterProduto(id);
  return produtoMapper.fromApiToDetalhe(produto);
}

export async function createProdutoRepository(payload: UpsertProdutoInput): Promise<number> {
  const apiPayload = produtoMapper.fromInputToApi(payload);
  const resultado = await apiCriarProduto(apiPayload);
  return resultado.id;
}

export async function updateProdutoRepository(id: number, payload: UpsertProdutoInput): Promise<void> {
  const apiPayload = produtoMapper.fromInputToApi(payload);
  await apiAtualizarProduto(id, apiPayload);
}

