import {
  createClienteRepository,
  deactivateClienteRepository,
  getClienteByIdRepository,
  listClientesRepository,
  updateClienteRepository
} from "@/data/repositories/cliente-repository";
import { ClienteFilters, UpsertClienteInput } from "@/domain/entities/cliente";

export function listClientesService(filters: ClienteFilters) {
  return listClientesRepository(filters);
}

export function getClienteByIdService(id: number) {
  return getClienteByIdRepository(id);
}

export function createClienteService(payload: UpsertClienteInput) {
  return createClienteRepository(payload);
}

export function updateClienteService(id: number, payload: UpsertClienteInput) {
  return updateClienteRepository(id, payload);
}

export function deactivateClienteService(id: number) {
  return deactivateClienteRepository(id);
}
