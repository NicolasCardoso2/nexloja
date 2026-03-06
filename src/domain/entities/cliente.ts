export type ClienteListItemEntity = {
  id: number;
  nome: string;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
  ativo: boolean;
};

export type ClienteResumoComprasEntity = {
  quantidade_vendas: number;
  total_gasto: number;
  ultima_compra_em?: string | null;
};

export type ClienteDetalheEntity = ClienteListItemEntity & {
  endereco?: string | null;
  observacoes?: string | null;
  resumo_compras: ClienteResumoComprasEntity;
};

export type ClienteFilters = {
  query?: string;
  ativo?: boolean;
};

export type UpsertClienteInput = {
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
};
