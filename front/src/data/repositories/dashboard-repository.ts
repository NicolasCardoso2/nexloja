import { obterDashboardResumo } from "@/services/api";
import { DashboardResumoEntity } from "@/domain/entities/dashboard";

function fromRaw(raw: any): DashboardResumoEntity {
  const caixaStatus = raw?.caixa_atual?.status;

  return {
    total_vendido_dia: Number(raw?.total_vendido_dia ?? 0),
    quantidade_vendas_dia: Number(raw?.quantidade_vendas_dia ?? 0),
    ticket_medio_dia: Number(raw?.ticket_medio_dia ?? 0),
    meta_diaria: Number(raw?.meta_diaria ?? 0),
    progresso_meta_diaria_pct: raw?.progresso_meta_diaria_pct !== null && raw?.progresso_meta_diaria_pct !== undefined
      ? Number(raw.progresso_meta_diaria_pct)
      : null,
    produtos_estoque_baixo: Number(raw?.produtos_estoque_baixo ?? 0),
    produtos_zerados: Number(raw?.produtos_zerados ?? 0),
    caixa_atual: {
      status:
        caixaStatus === "ABERTO" || caixaStatus === "FECHADO" || caixaStatus === "SEM_SESSAO"
          ? caixaStatus
          : "SEM_SESSAO",
      aberto_em: raw?.caixa_atual?.aberto_em ?? null,
      valor_inicial: raw?.caixa_atual?.valor_inicial ?? null,
      valor_movimentado: Number(raw?.caixa_atual?.valor_movimentado ?? 0)
    },
    ultimas_vendas: Array.isArray(raw?.ultimas_vendas) ? raw.ultimas_vendas : [],
    produtos_mais_vendidos: Array.isArray(raw?.produtos_mais_vendidos) ? raw.produtos_mais_vendidos : []
  };
}

export async function getDashboardResumoRepository(): Promise<DashboardResumoEntity> {
  const raw = await obterDashboardResumo();
  return fromRaw(raw);
}

