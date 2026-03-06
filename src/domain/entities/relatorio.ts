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
