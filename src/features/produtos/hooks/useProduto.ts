import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProdutosService, getProdutoByIdService, createProdutoService, updateProdutoService } from "../services/produto-service";
import { produtoQueryKeys } from "../services/produto-query-keys";
import type { ProdutoListItemEntity, ProdutoDetalheEntity, UpsertProdutoInput } from "@/domain/entities/produto";
import { DomainError, mapApiErrorToDomainError } from "@/domain/errors/domain-error";

/**
 * Hook para listar produtos
 * Gerencia cache automaticamente com React Query
 */
export function useListProdutos() {
  return useQuery<ProdutoListItemEntity[]>({
    queryKey: produtoQueryKeys.list(''),
    queryFn: async () => {
      try {
        return await listProdutosService();
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos (antigo cacheTime)
  });
}

/**
 * Hook para obter detalhes de um produto
 */
export function useGetProdutoById(id: number | null) {
  return useQuery<ProdutoDetalheEntity>({
    queryKey: produtoQueryKeys.detail(id ?? 0),
    queryFn: async () => {
      try {
        if (!id) throw new Error('ID inválido');
        return await getProdutoByIdService(id);
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
 * Hook para criar um novo produto
 * Invalida lista após sucesso (refetch automático)
 */
export function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation<number, DomainError, UpsertProdutoInput>({
    mutationFn: async (payload) => {
      try {
        return await createProdutoService(payload);
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    onSuccess: () => {
      // Invalida a lista de produtos para refetch automático
      queryClient.invalidateQueries({
        queryKey: produtoQueryKeys.all,
      });
    },
  });
}

/**
 * Hook para atualizar um produto
 * Invalida detalhes e lista após sucesso
 */
export function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation<void, DomainError, { id: number; payload: UpsertProdutoInput }>({
    mutationFn: async ({ id, payload }) => {
      try {
        return await updateProdutoService(id, payload);
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    onSuccess: (_, { id }) => {
      // Invalida os dados desse produto e a lista
      queryClient.invalidateQueries({
        queryKey: produtoQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: produtoQueryKeys.all,
      });
    },
  });
}
