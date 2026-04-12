import { obterDashboardResumo } from "@/services/api";
import { DashboardResumoEntity } from "@/domain/entities/dashboard";

function fromRaw(raw: any): DashboardResumoEntity {
  return {
    total_vendido_dia: raw.vendas_hoje || 0,
    quantidade_vendas_dia: raw.total_vendas || 0,
    ticket_medio_dia: (raw.vendas_hoje || 0) / (raw.total_vendas || 1),
    produtos_estoque_baixo: 0,
    produtos_zerados: 0,
    caixa_atual: {
      status: "ABERTO",
      aberto_em: new Date().toISOString(),
      valor_inicial: 0,
      valor_movimentado: 0
    },
    ultimas_vendas: [],
    produtos_mais_vendidos: []
  };
}

export async function getDashboardResumoRepository(): Promise<DashboardResumoEntity> {
  try {
    const raw = await obterDashboardResumo();
    return fromRaw(raw);
  } catch {
    return {
      total_vendido_dia: 0,
      quantidade_vendas_dia: 0,
      ticket_medio_dia: 0,
      produtos_estoque_baixo: 0,
      produtos_zerados: 0,
      caixa_atual: {
        status: "FECHADO",
        aberto_em: null,
        valor_inicial: null,
        valor_movimentado: 0
      },
      ultimas_vendas: [],
      produtos_mais_vendidos: []
    };
  }
}

