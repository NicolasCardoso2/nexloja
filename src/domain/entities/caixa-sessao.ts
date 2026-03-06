export type CaixaStatus = "ABERTO" | "FECHADO";

export type CaixaSessaoEntity = {
  id: number;
  usuario_id: number;
  aberto_em: string;
  fechado_em?: string | null;
  valor_abertura: number;
  valor_fechamento?: number | null;
  valor_sistema?: number | null;
  diferenca?: number | null;
  status: CaixaStatus;
  observacao?: string | null;
  total_movimentos: number;
  valor_final_calculado: number;
};

export type CaixaMovimentoEntity = {
  id: number;
  tipo: "ABERTURA" | "VENDA" | "SANGRIA" | "REFORCO" | "FECHAMENTO" | "SUPRIMENTO" | "ESTORNO";
  valor: number;
  observacao?: string | null;
  criado_em: string;
};

export type AbrirCaixaInput = {
  usuario_id: number;
  valor_inicial: number;
  observacoes?: string;
};

export type FecharCaixaInput = {
  usuario_id: number;
  valor_final_informado: number;
  observacoes?: string;
};
