import {
  listarClientes as apiListarClientes,
  obterCliente as apiObterCliente,
  criarCliente as apiCriarCliente,
  atualizarCliente as apiAtualizarCliente,
} from "@/services/api";
import {
  ClienteDetalheEntity,
  ClienteListItemEntity,
  UpsertClienteInput
} from "@/domain/entities/cliente";
import { clienteMapper } from "@/domain/mappers/cliente-mapper";

export async function listClientesRepository(): Promise<ClienteListItemEntity[]> {
  const clientes = await apiListarClientes();
  return clienteMapper.fromApiListToEntities(clientes);
}

export async function getClienteByIdRepository(id: number): Promise<ClienteDetalheEntity> {
  const cliente = await apiObterCliente(id);
  return clienteMapper.fromApiToDetalhe(cliente);
}

export async function createClienteRepository(payload: UpsertClienteInput): Promise<number> {
  const apiPayload = clienteMapper.fromInputToApi(payload);
  const resultado = await apiCriarCliente(apiPayload);
  return resultado.id;
}

export async function updateClienteRepository(id: number, payload: UpsertClienteInput): Promise<void> {
  const apiPayload = clienteMapper.fromInputToApi(payload);
  await apiAtualizarCliente(id, apiPayload);
}
