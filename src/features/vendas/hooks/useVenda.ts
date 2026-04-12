import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  searchProdutosVendaService,
  createVendaService,
  listVendasService,
  getVendaByIdService,
  cancelarVendaService
} from "../services/venda-service";
import { vendaQueryKeys } from "../services/venda-query-keys";
import type { 
  VendaListItemEntity, 
  VendaDetalheEntity, 
  ProdutoVendaBuscaEntity,
  FinalizarVendaInput,
  CancelarVendaInput
} from "@/domain/entities/venda";
import { DomainError, mapApiErrorToDomainError } from "@/domain/errors/domain-error";

/**
 * Hook para buscar produtos para venda
 * Atualiza conforme usuário digita
 */
export function useSearchProdutosVenda(query: string) {
  return useQuery<ProdutoVendaBuscaEntity[]>({
    queryKey: vendaQueryKeys.produtosBusca(query),
    queryFn: async () => {
      try {
        return await searchProdutosVendaService(query);
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    enabled: query.length > 0,
    staleTime: 10 * 1000, // 10 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para listar vendas
 */
export function useListVendas() {
  return useQuery<VendaListItemEntity[]>({
    queryKey: vendaQueryKeys.list(''),
    queryFn: async () => {
      try {
        return await listVendasService();
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obter detalhes de uma venda
 */
export function useGetVendaById(id: number | null) {
  return useQuery<VendaDetalheEntity>({
    queryKey: vendaQueryKeys.detail(id ?? 0),
    queryFn: async () => {
      try {
        if (!id) throw new Error('ID inválido');
        return await getVendaByIdService(id);
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
 * Hook para criar uma nova venda
 * Invalida lista após sucesso
 */
export function useCreateVenda() {
  const queryClient = useQueryClient();

  return useMutation<number, DomainError, FinalizarVendaInput>({
    mutationFn: async (payload) => {
      try {
        return await createVendaService(payload);
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    onSuccess: () => {
      // Invalida a lista de vendas para refetch automático
      queryClient.invalidateQueries({
        queryKey: vendaQueryKeys.all,
      });
    },
  });
}

/**
 * Hook para cancelar uma venda
 * Invalida detalhes e lista após sucesso
 */
export function useCancelarVenda() {
  const queryClient = useQueryClient();

  return useMutation<void, DomainError, CancelarVendaInput>({
    mutationFn: async (payload) => {
      try {
        return await cancelarVendaService(payload);
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    onSuccess: (_, payload) => {
      // Invalida os dados dessa venda e a lista
      queryClient.invalidateQueries({
        queryKey: vendaQueryKeys.detail(payload.venda_id),
      });
      queryClient.invalidateQueries({
        queryKey: vendaQueryKeys.all,
      });
    },
  });
}
