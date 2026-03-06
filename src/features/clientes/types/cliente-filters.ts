export type ClienteStatusFilter = "TODOS" | "ATIVO" | "INATIVO";

export type ClienteListState = {
  query: string;
  status: ClienteStatusFilter;
};

export function toClienteFilters(state: ClienteListState) {
  return {
    query: state.query.trim() || undefined,
    ativo: state.status === "TODOS" ? undefined : state.status === "ATIVO"
  };
}

export function serializeClienteFilters(state: ClienteListState): string {
  return JSON.stringify(state);
}
