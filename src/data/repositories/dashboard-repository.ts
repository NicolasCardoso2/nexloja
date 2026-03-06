import { tauriCommand } from "@/data/db/tauri-command";
import { DashboardResumoEntity } from "@/domain/entities/dashboard";

type DashboardResumoRaw = {
  totalVendidoDia: number;
  quantidadeVendasDia: number;
  ticketMedioDia: number;
  produtosEstoqueBaixo: number;
  produtosZerados: number;
  caixaAtual: {
    status: DashboardResumoEntity["caixa_atual"]["status"];
    abertoEm?: string | null;
    valorInicial?: number | null;
    valorMovimentado: number;
  };
  ultimasVendas: Array<{
    numeroVenda: string;
    criadoEm: string;
    clienteNome?: string | null;
    total: number;
    formaPagamento: string;
    status: "FINALIZADA" | "CANCELADA";
  }>;
  produtosMaisVendidos: Array<{
    produtoNome: string;
    quantidadeVendida: number;
    totalVendido: number;
  }>;
};

function fromRaw(raw: DashboardResumoRaw): DashboardResumoEntity {
  return {
    total_vendido_dia: raw.totalVendidoDia,
    quantidade_vendas_dia: raw.quantidadeVendasDia,
    ticket_medio_dia: raw.ticketMedioDia,
    produtos_estoque_baixo: raw.produtosEstoqueBaixo,
    produtos_zerados: raw.produtosZerados,
    caixa_atual: {
      status: raw.caixaAtual.status,
      aberto_em: raw.caixaAtual.abertoEm,
      valor_inicial: raw.caixaAtual.valorInicial,
      valor_movimentado: raw.caixaAtual.valorMovimentado
    },
    ultimas_vendas: raw.ultimasVendas.map((item) => ({
      numero_venda: item.numeroVenda,
      criado_em: item.criadoEm,
      cliente_nome: item.clienteNome,
      total: item.total,
      forma_pagamento: item.formaPagamento,
      status: item.status
    })),
    produtos_mais_vendidos: raw.produtosMaisVendidos.map((item) => ({
      produto_nome: item.produtoNome,
      quantidade_vendida: item.quantidadeVendida,
      total_vendido: item.totalVendido
    }))
  };
}

export async function getDashboardResumoRepository(usuarioId: number): Promise<DashboardResumoEntity> {
  const raw = await tauriCommand<DashboardResumoRaw>("get_dashboard_summary", { usuarioId });
  return fromRaw(raw);
}
