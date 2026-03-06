import { tauriCommand } from "@/data/db/tauri-command";
import { ItemVendaEntity } from "@/domain/entities/item-venda";
import {
  CancelarVendaInput,
  FinalizarVendaInput,
  ListVendasFilters,
  ProdutoVendaBuscaEntity,
  VendaDetalheEntity,
  VendaListItemEntity
} from "@/domain/entities/venda";

type ProdutoVendaBuscaRaw = {
  id: number;
  codigo: string;
  codigoBarras?: string | null;
  nome: string;
  precoVenda: number;
  estoqueAtual: number;
  ativo: boolean;
};

type VendaListRaw = {
  id: number;
  numeroVenda: string;
  criadoEm: string;
  clienteNome?: string | null;
  usuarioNome: string;
  formaPagamento: VendaListItemEntity["forma_pagamento"];
  total: number;
  status: VendaListItemEntity["status"];
};

type ItemVendaRaw = {
  produtoId: number;
  produtoNome: string;
  produtoCodigo: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

type VendaDetalheRaw = {
  id: number;
  numeroVenda: string;
  criadoEm: string;
  clienteId?: number | null;
  clienteNome?: string | null;
  usuarioId: number;
  usuarioNome: string;
  caixaSessaoId: number;
  formaPagamento: VendaDetalheEntity["forma_pagamento"];
  subtotal: number;
  desconto: number;
  total: number;
  status: VendaDetalheEntity["status"];
  canceladoEm?: string | null;
  motivoCancelamento?: string | null;
  itens: ItemVendaRaw[];
};

function fromProdutoBuscaRaw(raw: ProdutoVendaBuscaRaw): ProdutoVendaBuscaEntity {
  return {
    id: raw.id,
    codigo: raw.codigo,
    codigo_barras: raw.codigoBarras,
    nome: raw.nome,
    preco_venda: raw.precoVenda,
    estoque_atual: raw.estoqueAtual,
    ativo: raw.ativo
  };
}

function fromVendaListRaw(raw: VendaListRaw): VendaListItemEntity {
  return {
    id: raw.id,
    numero_venda: raw.numeroVenda,
    criado_em: raw.criadoEm,
    cliente_nome: raw.clienteNome,
    usuario_nome: raw.usuarioNome,
    forma_pagamento: raw.formaPagamento,
    total: raw.total,
    status: raw.status
  };
}

function fromItemRaw(raw: ItemVendaRaw): ItemVendaEntity {
  return {
    produto_id: raw.produtoId,
    produto_nome: raw.produtoNome,
    produto_codigo: raw.produtoCodigo,
    quantidade: raw.quantidade,
    preco_unitario: raw.precoUnitario,
    subtotal: raw.subtotal
  };
}

function fromVendaDetalheRaw(raw: VendaDetalheRaw): VendaDetalheEntity {
  return {
    id: raw.id,
    numero_venda: raw.numeroVenda,
    criado_em: raw.criadoEm,
    cliente_id: raw.clienteId,
    cliente_nome: raw.clienteNome,
    usuario_id: raw.usuarioId,
    usuario_nome: raw.usuarioNome,
    caixa_sessao_id: raw.caixaSessaoId,
    forma_pagamento: raw.formaPagamento,
    subtotal: raw.subtotal,
    desconto: raw.desconto,
    total: raw.total,
    status: raw.status,
    cancelado_em: raw.canceladoEm,
    motivo_cancelamento: raw.motivoCancelamento,
    itens: raw.itens.map(fromItemRaw)
  };
}

function toFinalizarPayload(input: FinalizarVendaInput) {
  return {
    usuarioId: input.usuario_id,
    clienteId: input.cliente_id,
    desconto: input.desconto,
    formaPagamento: input.forma_pagamento,
    itens: input.itens.map((item) => ({ produtoId: item.produto_id, quantidade: item.quantidade }))
  };
}

function toListFilters(filters: ListVendasFilters) {
  return {
    dataInicio: filters.dataInicio,
    dataFim: filters.dataFim,
    clienteId: filters.clienteId,
    status: filters.status
  };
}

function toCancelarPayload(input: CancelarVendaInput) {
  return {
    vendaId: input.venda_id,
    usuarioId: input.usuario_id,
    motivo: input.motivo
  };
}

export async function searchProdutosVendaRepository(query: string): Promise<ProdutoVendaBuscaEntity[]> {
  const raws = await tauriCommand<ProdutoVendaBuscaRaw[]>("search_sale_products", { query });
  return raws.map(fromProdutoBuscaRaw);
}

export async function createVendaRepository(payload: FinalizarVendaInput): Promise<number> {
  return tauriCommand<number>("create_sale", { payload: toFinalizarPayload(payload) });
}

export async function listVendasRepository(filters: ListVendasFilters): Promise<VendaListItemEntity[]> {
  const raws = await tauriCommand<VendaListRaw[]>("list_sales", { filters: toListFilters(filters) });
  return raws.map(fromVendaListRaw);
}

export async function getVendaByIdRepository(id: number): Promise<VendaDetalheEntity> {
  const raw = await tauriCommand<VendaDetalheRaw>("get_sale_by_id", { id });
  return fromVendaDetalheRaw(raw);
}

export async function cancelarVendaRepository(payload: CancelarVendaInput): Promise<void> {
  await tauriCommand<void>("cancel_sale", { payload: toCancelarPayload(payload) });
}
