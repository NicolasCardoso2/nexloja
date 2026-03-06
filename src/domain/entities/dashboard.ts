export type DashboardUltimaVendaEntity = {
  numero_venda: string;
  criado_em: string;
  cliente_nome?: string | null;
  total: number;
  forma_pagamento: string;
  status: "FINALIZADA" | "CANCELADA";
};

export type DashboardProdutoMaisVendidoEntity = {
  produto_nome: string;
  quantidade_vendida: number;
  total_vendido: number;
};

export type DashboardCaixaAtualEntity = {
  status: "ABERTO" | "FECHADO" | "SEM_SESSAO";
  aberto_em?: string | null;
  valor_inicial?: number | null;
  valor_movimentado: number;
};

export type DashboardResumoEntity = {
  total_vendido_dia: number;
  quantidade_vendas_dia: number;
  ticket_medio_dia: number;
  produtos_estoque_baixo: number;
  produtos_zerados: number;
  caixa_atual: DashboardCaixaAtualEntity;
  ultimas_vendas: DashboardUltimaVendaEntity[];
  produtos_mais_vendidos: DashboardProdutoMaisVendidoEntity[];
};
