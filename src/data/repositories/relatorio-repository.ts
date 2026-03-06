import { tauriCommand } from "@/data/db/tauri-command";
import {
  RelatorioEstoqueBaixoFilters,
  RelatorioEstoqueBaixoItem,
  RelatorioEstoqueFilters,
  RelatorioEstoqueItem,
  RelatorioProdutosVendidosFilters,
  RelatorioProdutoMaisVendido,
  RelatorioVendasFilters,
  RelatorioVendasResponse
} from "@/domain/entities/relatorio";

type RelatorioVendasRaw = {
  itens: Array<{
    numeroVenda: string;
    criadoEm: string;
    clienteNome?: string | null;
    usuarioNome: string;
    formaPagamento: string;
    subtotal: number;
    desconto: number;
    total: number;
    status: "FINALIZADA" | "CANCELADA";
  }>;
  resumo: {
    quantidadeVendas: number;
    totalVendidoFinalizadas: number;
    totalDescontosFinalizadas: number;
    ticketMedioFinalizadas: number;
  };
};

function toVendasFilters(filters: RelatorioVendasFilters) {
  return {
    dataInicio: filters.dataInicio,
    dataFim: filters.dataFim,
    clienteId: filters.clienteId,
    status: filters.status,
    formaPagamento: filters.formaPagamento
  };
}

function fromVendasRaw(raw: RelatorioVendasRaw): RelatorioVendasResponse {
  return {
    itens: raw.itens.map((item) => ({
      numero_venda: item.numeroVenda,
      criado_em: item.criadoEm,
      cliente_nome: item.clienteNome,
      usuario_nome: item.usuarioNome,
      forma_pagamento: item.formaPagamento,
      subtotal: item.subtotal,
      desconto: item.desconto,
      total: item.total,
      status: item.status
    })),
    resumo: {
      quantidade_vendas: raw.resumo.quantidadeVendas,
      total_vendido_finalizadas: raw.resumo.totalVendidoFinalizadas,
      total_descontos_finalizadas: raw.resumo.totalDescontosFinalizadas,
      ticket_medio_finalizadas: raw.resumo.ticketMedioFinalizadas
    }
  };
}

export async function reportVendasPorPeriodoRepository(
  filters: RelatorioVendasFilters
): Promise<RelatorioVendasResponse> {
  const raw = await tauriCommand<RelatorioVendasRaw>("report_sales_by_period", { filters: toVendasFilters(filters) });
  return fromVendasRaw(raw);
}

export async function reportProdutosMaisVendidosRepository(
  filters: RelatorioProdutosVendidosFilters
): Promise<RelatorioProdutoMaisVendido[]> {
  const items = await tauriCommand<
    Array<{
      produtoNome: string;
      produtoCodigo: string;
      categoriaNome: string;
      quantidadeVendida: number;
      totalVendido: number;
      precoMedioPraticado: number;
    }>
  >("report_top_selling_products", {
    filters: {
      dataInicio: filters.dataInicio,
      dataFim: filters.dataFim,
      categoriaId: filters.categoriaId
    }
  });

  return items.map((item) => ({
    produto_nome: item.produtoNome,
    produto_codigo: item.produtoCodigo,
    categoria_nome: item.categoriaNome,
    quantidade_vendida: item.quantidadeVendida,
    total_vendido: item.totalVendido,
    preco_medio_praticado: item.precoMedioPraticado
  }));
}

export async function reportEstoqueAtualRepository(filters: RelatorioEstoqueFilters): Promise<RelatorioEstoqueItem[]> {
  const items = await tauriCommand<
    Array<{
      codigo: string;
      produtoNome: string;
      categoriaNome: string;
      estoqueAtual: number;
      estoqueMinimo: number;
      statusEstoque: "NORMAL" | "BAIXO" | "ZERADO";
      ativo: boolean;
    }>
  >("report_current_stock", {
    filters: {
      query: filters.query,
      categoriaId: filters.categoriaId,
      ativo: filters.ativo
    }
  });

  return items.map((item) => ({
    codigo: item.codigo,
    produto_nome: item.produtoNome,
    categoria_nome: item.categoriaNome,
    estoque_atual: item.estoqueAtual,
    estoque_minimo: item.estoqueMinimo,
    status_estoque: item.statusEstoque,
    ativo: item.ativo
  }));
}

export async function reportEstoqueBaixoRepository(
  filters: RelatorioEstoqueBaixoFilters
): Promise<RelatorioEstoqueBaixoItem[]> {
  const items = await tauriCommand<
    Array<{
      codigo: string;
      produtoNome: string;
      categoriaNome: string;
      estoqueAtual: number;
      estoqueMinimo: number;
      diferencaReposicao: number;
      statusEstoque: "BAIXO" | "ZERADO";
    }>
  >("report_low_stock", {
    filters: {
      query: filters.query,
      categoriaId: filters.categoriaId
    }
  });

  return items.map((item) => ({
    codigo: item.codigo,
    produto_nome: item.produtoNome,
    categoria_nome: item.categoriaNome,
    estoque_atual: item.estoqueAtual,
    estoque_minimo: item.estoqueMinimo,
    diferenca_reposicao: item.diferencaReposicao,
    status_estoque: item.statusEstoque
  }));
}
