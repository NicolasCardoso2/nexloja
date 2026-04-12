import type { VendaListItemEntity, VendaDetalheEntity, ProdutoVendaBuscaEntity } from "@/domain/entities/venda";

/**
 * Mapper para transformações entre API Response e Entities de Venda
 */
export const vendaMapper = {
  /**
   * Transforma resposta da API em VendaListItemEntity
   */
  fromApiToListItem(raw: any): VendaListItemEntity {
    return {
      id: raw.id,
      numero_venda: raw.numero_venda,
      criado_em: raw.criado_em,
      cliente_nome: raw.cliente_nome || null,
      usuario_nome: raw.usuario_nome,
      forma_pagamento: raw.forma_pagamento,
      total: raw.total,
      status: raw.status,
    };
  },

  /**
   * Transforma resposta da API em VendaDetalheEntity
   */
  fromApiToDetalhe(raw: any): VendaDetalheEntity {
    return {
      id: raw.id,
      numero_venda: raw.numero_venda,
      criado_em: raw.criado_em,
      cliente_id: raw.cliente_id || null,
      cliente_nome: raw.cliente_nome || null,
      usuario_id: raw.usuario_id,
      usuario_nome: raw.usuario_nome,
      caixa_sessao_id: raw.caixa_sessao_id,
      forma_pagamento: raw.forma_pagamento,
      subtotal: raw.subtotal,
      desconto: raw.desconto || 0,
      total: raw.total,
      status: raw.status,
      cancelado_em: raw.cancelado_em || null,
      motivo_cancelamento: raw.motivo_cancelamento || null,
      itens: (raw.itens || []).map((item: any) => ({
        id: item.id,
        produto_id: item.produto_id,
        produto_nome: item.produto_nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal,
      })),
    };
  },

  /**
   * Transforma ProdutoVendaBuscaEntity de API
   */
  fromApiToProdutoVendaBusca(raw: any): ProdutoVendaBuscaEntity {
    return {
      id: raw.id,
      codigo: raw.codigo || raw.sku || '',
      codigo_barras: raw.codigo_barras || null,
      nome: raw.nome,
      preco_venda: raw.preco_venda,
      estoque_atual: raw.estoque_atual || raw.quantidade || 0,
      ativo: raw.ativo,
    };
  },

  /**
   * Lista de vendas da API para Entities
   */
  fromApiListToEntities(raw: any[]): VendaListItemEntity[] {
    return raw.map(item => this.fromApiToListItem(item));
  },
};
