import type { ProdutoListItemEntity, ProdutoDetalheEntity, UpsertProdutoInput } from "@/domain/entities/produto";

/**
 * Mapper para transformações entre API Response e Entities
 * Centraliza a lógica de transformação, evitando repetição
 */
export const produtoMapper = {
  /**
   * Transforma resposta da API em ProdutoListItemEntity
   */
  fromApiToListItem(raw: any): ProdutoListItemEntity {
    return {
      id: raw.id,
      codigo: raw.sku || '',
      nome: raw.nome,
      categoria_id: raw.categoria_id,
      categoria_nome: raw.categoria_nome,
      preco_venda: raw.preco_venda,
      estoque_atual: raw.quantidade || 0,
      ativo: raw.ativo,
      codigo_barras: raw.codigo_barras || null,
    };
  },

  /**
   * Transforma resposta da API em ProdutoDetalheEntity
   */
  fromApiToDetalhe(raw: any): ProdutoDetalheEntity {
    return {
      id: raw.id,
      codigo: raw.sku || '',
      nome: raw.nome,
      categoria_id: raw.categoria_id,
      categoria_nome: raw.categoria_nome,
      preco_venda: raw.preco_venda,
      estoque_atual: raw.quantidade || 0,
      estoque_minimo: raw.estoque_minimo || 0,
      descricao: raw.descricao || null,
      preco_custo: raw.preco_custo || 0,
      marca: raw.marca || null,
      unidade: raw.unidade || 'UN',
      ativo: raw.ativo,
      codigo_barras: raw.codigo_barras || null,
      imagem_path: raw.imagem_path || null,
    };
  },

  /**
   * Transforma UpsertProdutoInput para formato esperado pela API
   */
  fromInputToApi(input: UpsertProdutoInput): Record<string, any> {
    return {
      nome: input.nome,
      category_id: input.categoria_id,
      preco_venda: input.preco_venda,
      preco_custo: input.preco_custo ?? 0,
      sku: input.codigo,
      descricao: input.descricao || null,
      quantidade: input.estoque_atual,
      estoque_minimo: input.estoque_minimo,
      codigo_barras: input.codigo_barras || null,
      marca: input.marca || null,
      unidade: input.unidade || 'UN',
      imagem_path: input.imagem_path || null,
      ativo: input.ativo,
    };
  },

  /**
   * Lista de produtos da API para Entities
   */
  fromApiListToEntities(raw: any[]): ProdutoListItemEntity[] {
    return raw.map(item => this.fromApiToListItem(item));
  },
};
