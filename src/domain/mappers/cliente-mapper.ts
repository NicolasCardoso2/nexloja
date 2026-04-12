import type { ClienteListItemEntity, ClienteDetalheEntity, UpsertClienteInput } from "@/domain/entities/cliente";

/**
 * Mapper para transformações entre API Response e Entities do Cliente
 */
export const clienteMapper = {
  /**
   * Transforma resposta da API em ClienteListItemEntity
   */
  fromApiToListItem(raw: any): ClienteListItemEntity {
    return {
      id: raw.id,
      nome: raw.nome,
      cpf: raw.cpf || null,
      email: raw.email || null,
      telefone: raw.telefone || null,
      ativo: raw.ativo,
    };
  },

  /**
   * Transforma resposta da API em ClienteDetalheEntity
   */
  fromApiToDetalhe(raw: any): ClienteDetalheEntity {
    return {
      id: raw.id,
      nome: raw.nome,
      cpf: raw.cpf || null,
      email: raw.email || null,
      telefone: raw.telefone || null,
      ativo: raw.ativo,
      endereco: raw.endereco || null,
      observacoes: raw.observacoes || null,
      resumo_compras: {
        quantidade_vendas: raw.resumo_compras?.quantidade_vendas || 0,
        total_gasto: raw.resumo_compras?.total_gasto || 0,
        ultima_compra_em: raw.resumo_compras?.ultima_compra_em || null,
      },
    };
  },

  /**
   * Transforma UpsertClienteInput para formato esperado pela API
   */
  fromInputToApi(input: UpsertClienteInput): Record<string, any> {
    return {
      nome: input.nome,
      cpf: input.cpf || null,
      email: input.email || null,
      telefone: input.telefone || null,
      endereco: input.endereco || null,
      observacoes: input.observacoes || null,
      ativo: input.ativo,
    };
  },

  /**
   * Lista de clientes da API para Entities
   */
  fromApiListToEntities(raw: any[]): ClienteListItemEntity[] {
    return raw.map(item => this.fromApiToListItem(item));
  },
};
