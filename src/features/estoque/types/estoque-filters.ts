export type EstoqueListState = {
  query: string;
  categoriaId: number | null;
  apenasEstoqueBaixo: boolean;
  produtoHistoricoId: number | null;
};

export function toEstoqueFilters(state: EstoqueListState) {
  return {
    query: state.query.trim() || undefined,
    categoriaId: state.categoriaId ?? undefined,
    apenasEstoqueBaixo: state.apenasEstoqueBaixo
  };
}

export function toMovimentacaoFilters(state: EstoqueListState) {
  return {
    produtoId: state.produtoHistoricoId ?? undefined
  };
}

export function serializeEstoqueState(state: EstoqueListState): string {
  return JSON.stringify(state);
}
