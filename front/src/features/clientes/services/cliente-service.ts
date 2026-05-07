import {
  createClienteRepository,
  getClienteByIdRepository,
  listClientesRepository,
  updateClienteRepository
} from "@/data/repositories/cliente-repository";
import { ClienteListItemEntity, ClienteDetalheEntity, UpsertClienteInput } from "@/domain/entities/cliente";
import { DadosInvalidosError } from "@/domain/errors/domain-error";

/**
 * Service para listar clientes
 * Aplica regras de negócio e orquestra operações
 */
export async function listClientesService(filters?: { query?: string; ativo?: boolean }): Promise<ClienteListItemEntity[]> {
  return await listClientesRepository(filters);
}

/**
 * Service para obter cliente por ID
 * Valida existência e aplica regras
 */
export async function getClienteByIdService(id: number): Promise<ClienteDetalheEntity> {
  return await getClienteByIdRepository(id);
}

/**
 * Service para criar um novo cliente
 * Valida regras de negócio antes de persistir
 * - Validação de campos obrigatórios
 * - Validação de CPF (se fornecido)
 * - Validação de email (se fornecido)
 */
export async function createClienteService(payload: UpsertClienteInput): Promise<number> {
  // Validar campo obrigatório: nome
  if (!payload.nome || payload.nome.trim().length === 0) {
    throw new DadosInvalidosError('nome', 'Nome é obrigatório');
  }

  // Persistir no repositório
  return await createClienteRepository(payload);
}

/**
 * Service para atualizar um cliente
 * Valida regras antes de persistir
 */
export async function updateClienteService(id: number, payload: UpsertClienteInput): Promise<void> {
  // Validar campo obrigatório: nome
  if (!payload.nome || payload.nome.trim().length === 0) {
    throw new DadosInvalidosError('nome', 'Nome é obrigatório');
  }

  // Persistir no repositório
  return await updateClienteRepository(id, payload);
}
