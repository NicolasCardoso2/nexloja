import type { EstoqueItemEntity, MovimentacaoEstoqueEntity, ProdutoMovimentacaoOptionEntity } from "@/domain/entities/movimentacao-estoque";

/**
 * Calcula status do estoque baseado em quantidade e mínimo
 */
function calcularStatusEstoque(
  estoque_atual: number,
  estoque_minimo: number
): 'NORMAL' | 'BAIXO' | 'ZERADO' {
  if (estoque_atual === 0) return 'ZERADO';
  if (estoque_atual <= estoque_minimo) return 'BAIXO';
  return 'NORMAL';
}

/**
 * Mapper para transformações entre API Response e Entities de Estoque
 */
export const estoqueMapper = {
  /**
   * Transforma resposta da API em EstoqueItemEntity
   */
  fromApiToEstoqueItem(raw: any): EstoqueItemEntity {
    return {
      produto_id: raw.produto_id,
      codigo: raw.codigo || raw.sku || '',
      nome: raw.nome,
      categoria_id: raw.categoria_id,
      categoria_nome: raw.categoria_nome,
      estoque_atual: raw.estoque_atual || raw.quantidade || 0,
      estoque_minimo: raw.estoque_minimo || 0,
      status_estoque: calcularStatusEstoque(
        raw.estoque_atual || raw.quantidade || 0,
        raw.estoque_minimo || 0
      ),
      ativo: raw.ativo,
    };
  },

  /**
   * Transforma resposta da API em MovimentacaoEstoqueEntity
   */
  fromApiToMovimentacao(raw: any): MovimentacaoEstoqueEntity {
    return {
      id: raw.id,
      produto_id: raw.produto_id,
      produto_nome: raw.produto_nome,
      produto_codigo: raw.produto_codigo || raw.sku || '',
      tipo: raw.tipo,
      quantidade: raw.quantidade,
      estoque_antes: raw.estoque_antes,
      estoque_depois: raw.estoque_depois,
      motivo: raw.motivo,
      observacao: raw.observacao || null,
      usuario_id: raw.usuario_id,
      criado_em: raw.criado_em,
    };
  },

  /**
   * Transforma resposta da API em ProdutoMovimentacaoOptionEntity
   */
  fromApiToProdutoMovimentacao(raw: any): ProdutoMovimentacaoOptionEntity {
    return {
      id: raw.id,
      codigo: raw.codigo || raw.sku || '',
      nome: raw.nome,
      ativo: raw.ativo,
    };
  },

  /**
   * Lista de itens de estoque da API para Entities
   */
  fromApiListToEstoqueItems(raw: any[]): EstoqueItemEntity[] {
    return raw.map(item => this.fromApiToEstoqueItem(item));
  },

  /**
   * Lista de movimentações da API para Entities
   */
  fromApiListToMovimentacoes(raw: any[]): MovimentacaoEstoqueEntity[] {
    return raw.map(item => this.fromApiToMovimentacao(item));
  },
};
