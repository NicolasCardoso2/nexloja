import { ProdutoFilters } from "@/domain/entities/produto";

export type ProdutoStatusFilter = "TODOS" | "ATIVO" | "INATIVO";

export type ProdutoListState = {
  query: string;
  categoriaId: number | null;
  status: ProdutoStatusFilter;
};

export function toProdutoFilters(state: ProdutoListState): ProdutoFilters {
  return {
    query: state.query.trim() || undefined,
    categoriaId: state.categoriaId ?? undefined,
    ativo: state.status === "TODOS" ? undefined : state.status === "ATIVO"
  };
}

export function serializeProdutoFilters(state: ProdutoListState): string {
  return JSON.stringify(state);
}
