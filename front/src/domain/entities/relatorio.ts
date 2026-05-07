export type RelatorioVendaItem = {
  numero_venda: string;
  criado_em: string;
  cliente_nome?: string | null;
  usuario_nome: string;
  forma_pagamento: string;
  subtotal: number;
  desconto: number;
  total: number;
  status: "FINALIZADA" | "CANCELADA";
};

export type RelatorioVendasResumo = {
  quantidade_vendas: number;
  total_vendido_finalizadas: number;
  total_descontos_finalizadas: number;
  ticket_medio_finalizadas: number;
};

export type RelatorioVendasResponse = {
  itens: RelatorioVendaItem[];
  resumo: RelatorioVendasResumo;
};

export type RelatorioProdutoMaisVendido = {
  produto_nome: string;
  produto_codigo: string;
  categoria_nome: string;
  quantidade_vendida: number;
  total_vendido: number;
  preco_medio_praticado: number;
};

export type RelatorioEstoqueItem = {
  codigo: string;
  produto_nome: string;
  categoria_nome: string;
  estoque_atual: number;
  estoque_minimo: number;
  status_estoque: "NORMAL" | "BAIXO" | "ZERADO";
  ativo: boolean;
};

export type RelatorioEstoqueBaixoItem = {
  codigo: string;
  produto_nome: string;
  categoria_nome: string;
  estoque_atual: number;
  estoque_minimo: number;
  diferenca_reposicao: number;
  status_estoque: "BAIXO" | "ZERADO";
};

export type RelatorioVendasFilters = {
  dataInicio?: string;
  dataFim?: string;
  clienteId?: number;
  status?: "FINALIZADA" | "CANCELADA";
  formaPagamento?: "DINHEIRO" | "PIX" | "CARTAO_DEBITO" | "CARTAO_CREDITO";
};

export type RelatorioProdutosVendidosFilters = {
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: number;
};

export type RelatorioEstoqueFilters = {
  query?: string;
  categoriaId?: number;
  ativo?: boolean;
};

export type RelatorioEstoqueBaixoFilters = {
  query?: string;
  categoriaId?: number;
};

// --- Lucro Real ---
export type RelatorioLucroPorProduto = {
  produto_nome: string;
  produto_codigo: string;
  categoria_nome: string;
  preco_custo: number;
  quantidade_vendida: number;
  total_faturado: number;
  total_custo: number;
  lucro: number;
  margem_pct: number;
};

export type RelatorioLucroPorCategoria = {
  categoria_nome: string;
  total_faturado: number;
  total_custo: number;
  lucro: number;
  margem_pct: number;
};

export type RelatorioLucroResumo = {
  total_faturado: number;
  total_custo: number;
  lucro_bruto: number;
  margem_media_pct: number;
};

export type RelatorioLucroResponse = {
  resumo: RelatorioLucroResumo;
  por_produto: RelatorioLucroPorProduto[];
  por_categoria: RelatorioLucroPorCategoria[];
};

// --- Curva ABC ---
export type CurvaAbcItem = {
  produto_nome: string;
  produto_codigo: string;
  categoria_nome: string;
  quantidade_vendida: number;
  total_faturado: number;
  pct_produto: number;
  pct_acumulado: number;
  classe: "A" | "B" | "C";
};

export type CurvaAbcResumo = {
  total_faturado: number;
  classe_a: number;
  classe_b: number;
  classe_c: number;
};

export type CurvaAbcResponse = {
  resumo: CurvaAbcResumo;
  itens: CurvaAbcItem[];
};

// --- Reposição Inteligente ---
export type ReposicaoItem = {
  id: number;
  codigo: string;
  produto_nome: string;
  categoria_nome: string;
  estoque_atual: number;
  estoque_minimo: number;
  preco_custo: number;
  vendido_30d: number;
  velocidade_dia: number;
  dias_cobertura: number | null;
  quantidade_sugerida: number;
  custo_reposicao: number;
  alerta: boolean;
};

export type ReposicaoResponse = {
  custo_total_sugerido: number;
  itens: ReposicaoItem[];
};

// --- Sazonalidade ---
export type SazonalidadeSemana = {
  semana: string;
  inicio_semana: string;
  quantidade_vendas: number;
  total_vendido: number;
  ticket_medio: number;
  acima_media: boolean;
};

export type SazonalidadeResponse = {
  media_semanal: number;
  semanas: SazonalidadeSemana[];
};

// --- Saúde do Negócio ---
export type SaudeNegocioResponse = {
  meta_diaria: number;
  dia: {
    faturado: number;
    vendas: number;
    ticket: number;
    pct_meta: number | null;
  };
  semana: {
    faturado: number;
    vendas: number;
  };
  mes: {
    faturado: number;
    vendas: number;
    ticket: number;
  };
  margem_media_mes_pct: number;
};
