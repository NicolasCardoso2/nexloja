import { VendaStatus } from "@/domain/entities/venda";

export type VendasListState = {
  dataInicio: string;
  dataFim: string;
  clienteId: number | null;
  status: "TODOS" | VendaStatus;
};

export function toVendasFilters(state: VendasListState) {
  return {
    dataInicio: state.dataInicio || undefined,
    dataFim: state.dataFim || undefined,
    clienteId: state.clienteId ?? undefined,
    status: state.status === "TODOS" ? undefined : state.status
  };
}

export function serializeVendasFilters(state: VendasListState): string {
  return JSON.stringify(state);
}
