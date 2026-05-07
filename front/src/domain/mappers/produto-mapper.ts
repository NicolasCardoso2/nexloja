import type { ProdutoListItemEntity, ProdutoDetalheEntity, UpsertProdutoInput } from "@/domain/entities/produto";

/**
 * Mapper para transformações entre API Response e Entities
 * Centraliza a lógica de transformação, evitando repetição
 */
export const produtoMapper = {
  toNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  },

  /**
   * Transforma resposta da API em ProdutoListItemEntity
   */
  fromApiToListItem(raw: any): ProdutoListItemEntity {
    return {
      id: raw.id,
      codigo: raw.codigo || raw.sku || '',
      nome: raw.nome,
      categoria_id: raw.categoria_id,
      categoria_nome: raw.categoria_nome,
      preco_venda: this.toNumber(raw.preco_venda),
      estoque_atual: this.toNumber(raw.estoque_atual ?? raw.quantidade),
      ativo: Boolean(raw.ativo),
      codigo_barras: raw.codigo_barras || null,
    };
  },

  /**
   * Transforma resposta da API em ProdutoDetalheEntity
   */
  fromApiToDetalhe(raw: any): ProdutoDetalheEntity {
    return {
      id: raw.id,
      codigo: raw.codigo || raw.sku || '',
      nome: raw.nome,
      categoria_id: raw.categoria_id,
      categoria_nome: raw.categoria_nome,
      preco_venda: this.toNumber(raw.preco_venda),
      estoque_atual: this.toNumber(raw.estoque_atual ?? raw.quantidade),
      estoque_minimo: this.toNumber(raw.estoque_minimo),
      descricao: raw.descricao || null,
      preco_custo: this.toNumber(raw.preco_custo),
      marca: raw.marca || null,
      unidade: raw.unidade || 'UN',
      ativo: Boolean(raw.ativo),
      codigo_barras: raw.codigo_barras || null,
      imagem_path: raw.imagem_path || null,
    };
  },

  /**
   * Transforma UpsertProdutoInput para formato esperado pela API
   */
  fromInputToApi(input: UpsertProdutoInput): Record<string, any> {
    return {
      codigo: input.codigo,
      nome: input.nome,
      categoria_id: input.categoria_id,
      preco_venda: this.toNumber(input.preco_venda),
      preco_custo: this.toNumber(input.preco_custo),
      descricao: input.descricao || null,
      estoque_atual: this.toNumber(input.estoque_atual),
      estoque_minimo: this.toNumber(input.estoque_minimo),
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
