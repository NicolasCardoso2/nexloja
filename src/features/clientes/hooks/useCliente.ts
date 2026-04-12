import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listClientesService, getClienteByIdService, createClienteService, updateClienteService } from "../services/cliente-service";
import { clienteQueryKeys } from "../services/cliente-query-keys";
import type { ClienteListItemEntity, ClienteDetalheEntity, UpsertClienteInput } from "@/domain/entities/cliente";
import { DomainError, mapApiErrorToDomainError } from "@/domain/errors/domain-error";

/**
 * Hook para listar clientes
 * Gerencia cache automaticamente com React Query
 */
export function useListClientes() {
  return useQuery<ClienteListItemEntity[]>({
    queryKey: clienteQueryKeys.list(''),
    queryFn: async () => {
      try {
        return await listClientesService();
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obter detalhes de um cliente
 */
export function useGetClienteById(id: number | null) {
  return useQuery<ClienteDetalheEntity>({
    queryKey: clienteQueryKeys.detail(id ?? 0),
    queryFn: async () => {
      try {
        if (!id) throw new Error('ID inválido');
        return await getClienteByIdService(id);
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    enabled: id !== null,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para criar um novo cliente
 * Invalida lista após sucesso (refetch automático)
 */
export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation<number, DomainError, UpsertClienteInput>({
    mutationFn: async (payload) => {
      try {
        return await createClienteService(payload);
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    onSuccess: () => {
      // Invalida a lista de clientes para refetch automático
      queryClient.invalidateQueries({
        queryKey: clienteQueryKeys.all,
      });
    },
  });
}

/**
 * Hook para atualizar um cliente
 * Invalida detalhes e lista após sucesso
 */
export function useUpdateCliente() {
  const queryClient = useQueryClient();

  return useMutation<void, DomainError, { id: number; payload: UpsertClienteInput }>({
    mutationFn: async ({ id, payload }) => {
      try {
        return await updateClienteService(id, payload);
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    onSuccess: (_, { id }) => {
      // Invalida os dados desse cliente e a lista
      queryClient.invalidateQueries({
        queryKey: clienteQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: clienteQueryKeys.all,
      });
    },
  });
}
