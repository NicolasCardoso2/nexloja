import { listarRelatorioVendas, listarRelatorioProdutos } from "@/services/api";
import {
  RelatorioEstoqueBaixoItem,
  RelatorioEstoqueItem,
  RelatorioProdutoMaisVendido,
  RelatorioVendasResponse
} from "@/domain/entities/relatorio";

function fromVendasRaw(itens: any[]): RelatorioVendasResponse {
  const resumo = itens.reduce(
    (acc, item) => ({
      quantidade_vendas: acc.quantidade_vendas + 1,
      total_vendido_finalizadas: acc.total_vendido_finalizadas + (item.total || 0),
      total_descontos_finalizadas: acc.total_descontos_finalizadas,
      ticket_medio_finalizadas: 0
    }),
    {
      quantidade_vendas: 0,
      total_vendido_finalizadas: 0,
      total_descontos_finalizadas: 0,
      ticket_medio_finalizadas: 0
    }
  );

  return {
    itens: itens.map((item) => ({
      numero_venda: `VND-${item.id}`,
      criado_em: item.criado_em,
      cliente_nome: item.cliente_nome,
      usuario_nome: "Usuário",
      forma_pagamento: "LOJA_VIRTUAL",
      subtotal: item.total,
      desconto: 0,
      total: item.total,
      status: item.status
    })),
    resumo: {
      ...resumo,
      ticket_medio_finalizadas:
        resumo.quantidade_vendas > 0
          ? resumo.total_vendido_finalizadas / resumo.quantidade_vendas
          : 0
    }
  };
}

export async function reportVendasPorPeriodoRepository(): Promise<RelatorioVendasResponse> {
  try {
    const raw = await listarRelatorioVendas();
    return fromVendasRaw(raw);
  } catch {
    return {
      itens: [],
      resumo: {
        quantidade_vendas: 0,
        total_vendido_finalizadas: 0,
        total_descontos_finalizadas: 0,
        ticket_medio_finalizadas: 0
      }
    };
  }
}

export async function reportProdutosMaisVendidosRepository(): Promise<RelatorioProdutoMaisVendido[]> {
  try {
    const items = await listarRelatorioProdutos();
    return items.map((item: any) => ({
      produto_nome: item.nome,
      produto_codigo: item.id.toString(),
      categoria_nome: "",
      quantidade_vendida: 0,
      total_vendido: 0,
      preco_medio_praticado: item.preco_venda
    }));
  } catch {
    return [];
  }
}

export async function reportEstoqueAtualRepository(): Promise<RelatorioEstoqueItem[]> {
  try {
    const items = await listarRelatorioProdutos();
    return items.map((item: any) => ({
      codigo: item.id.toString(),
      produto_nome: item.nome,
      categoria_nome: "",
      estoque_atual: item.quantidade,
      estoque_minimo: 0,
      status_estoque: item.quantidade <= 0 ? "ZERADO" : "NORMAL",
      ativo: item.ativo
    }));
  } catch {
    return [];
  }
}

export async function reportEstoqueBaixoRepository(): Promise<RelatorioEstoqueBaixoItem[]> {
  try {
    const items = await listarRelatorioProdutos();
    return items
      .filter((item: any) => item.quantidade <= 0)
      .map((item: any) => ({
        codigo: item.id.toString(),
        produto_nome: item.nome,
        categoria_nome: "",
        estoque_atual: item.quantidade,
        estoque_minimo: 0,
        diferenca_reposicao: Math.abs(item.quantidade),
        status_estoque: item.quantidade <= 0 ? "ZERADO" : "BAIXO"
      }));
  } catch {
    return [];
  }
}
