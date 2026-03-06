import {
  cancelarVendaRepository,
  createVendaRepository,
  getVendaByIdRepository,
  listVendasRepository,
  searchProdutosVendaRepository
} from "@/data/repositories/venda-repository";
import { CancelarVendaInput, FinalizarVendaInput, ListVendasFilters } from "@/domain/entities/venda";

export function searchProdutosVendaService(query: string) {
  return searchProdutosVendaRepository(query);
}

export function createVendaService(payload: FinalizarVendaInput) {
  return createVendaRepository(payload);
}

export function listVendasService(filters: ListVendasFilters) {
  return listVendasRepository(filters);
}

export function getVendaByIdService(id: number) {
  return getVendaByIdRepository(id);
}

export function cancelarVendaService(payload: CancelarVendaInput) {
  return cancelarVendaRepository(payload);
}
