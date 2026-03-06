export type EstoqueStatus = "NORMAL" | "BAIXO" | "ZERADO";

export type EstoqueItemEntity = {
  produto_id: number;
  codigo: string;
  nome: string;
  categoria_id: number;
  categoria_nome: string;
  estoque_atual: number;
  estoque_minimo: number;
  status_estoque: EstoqueStatus;
  ativo: boolean;
};

export type ProdutoMovimentacaoOptionEntity = {
  id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
};

export type MovimentacaoEstoqueEntity = {
  id: number;
  produto_id: number;
  produto_nome: string;
  produto_codigo: string;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
  quantidade: number;
  estoque_antes: number;
  estoque_depois: number;
  motivo: string;
  observacao?: string | null;
  usuario_id: number;
  criado_em: string;
};

export type EstoqueFilters = {
  query?: string;
  categoriaId?: number;
  apenasEstoqueBaixo?: boolean;
};

export type MovimentacaoFilters = {
  produtoId?: number;
};

export type RegistrarMovimentacaoInput = {
  produto_id: number;
  usuario_id: number;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
  quantidade: number;
  motivo: string;
  observacao?: string;
};
