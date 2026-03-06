import { ItemVendaEntity } from "@/domain/entities/item-venda";

export type FormaPagamento = "DINHEIRO" | "PIX" | "CARTAO_DEBITO" | "CARTAO_CREDITO";

export type VendaStatus = "FINALIZADA" | "CANCELADA";

export type VendaListItemEntity = {
  id: number;
  numero_venda: string;
  criado_em: string;
  cliente_nome?: string | null;
  usuario_nome: string;
  forma_pagamento: FormaPagamento;
  total: number;
  status: VendaStatus;
};

export type VendaDetalheEntity = {
  id: number;
  numero_venda: string;
  criado_em: string;
  cliente_id?: number | null;
  cliente_nome?: string | null;
  usuario_id: number;
  usuario_nome: string;
  caixa_sessao_id: number;
  forma_pagamento: FormaPagamento;
  subtotal: number;
  desconto: number;
  total: number;
  status: VendaStatus;
  cancelado_em?: string | null;
  motivo_cancelamento?: string | null;
  itens: ItemVendaEntity[];
};

export type ProdutoVendaBuscaEntity = {
  id: number;
  codigo: string;
  codigo_barras?: string | null;
  nome: string;
  preco_venda: number;
  estoque_atual: number;
  ativo: boolean;
};

export type FinalizarVendaItemInput = {
  produto_id: number;
  quantidade: number;
};

export type FinalizarVendaInput = {
  usuario_id: number;
  cliente_id?: number;
  desconto: number;
  forma_pagamento: FormaPagamento;
  itens: FinalizarVendaItemInput[];
};

export type ListVendasFilters = {
  dataInicio?: string;
  dataFim?: string;
  clienteId?: number;
  status?: VendaStatus;
};

export type CancelarVendaInput = {
  venda_id: number;
  usuario_id: number;
  motivo?: string;
};
