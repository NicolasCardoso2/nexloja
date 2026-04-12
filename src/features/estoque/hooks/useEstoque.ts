import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listEstoqueService,
  listProdutosMovimentacaoService,
  listMovimentacoesEstoqueService,
  registrarMovimentacaoEstoqueService
} from "../services/estoque-service";
import { estoqueQueryKeys } from "../services/estoque-query-keys";
import type {
  EstoqueItemEntity,
  MovimentacaoEstoqueEntity,
  ProdutoMovimentacaoOptionEntity,
  RegistrarMovimentacaoInput
} from "@/domain/entities/movimentacao-estoque";
import { DomainError, mapApiErrorToDomainError } from "@/domain/errors/domain-error";

/**
 * Hook para listar itens de estoque
 */
export function useListEstoque() {
  return useQuery<EstoqueItemEntity[]>({
    queryKey: estoqueQueryKeys.list(''),
    queryFn: async () => {
      try {
        return await listEstoqueService();
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para listar produtos para movimentação
 */
export function useListProdutosMovimentacao() {
  return useQuery<ProdutoMovimentacaoOptionEntity[]>({
    queryKey: estoqueQueryKeys.produtosMovimentacao,
    queryFn: async () => {
      try {
        return await listProdutosMovimentacaoService();
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

/**
 * Hook para listar movimentações do estoque
 */
export function useListMovimentacoesEstoque() {
  return useQuery<MovimentacaoEstoqueEntity[]>({
    queryKey: estoqueQueryKeys.movimentacoes(''),
    queryFn: async () => {
      try {
        return await listMovimentacoesEstoqueService();
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para registrar movimentação de estoque
 * Invalida lista de estoque e movimentações após sucesso
 */
export function useRegistrarMovimentacao() {
  const queryClient = useQueryClient();

  return useMutation<void, DomainError, RegistrarMovimentacaoInput>({
    mutationFn: async (payload) => {
      try {
        return await registrarMovimentacaoEstoqueService(payload);
      } catch (error) {
        throw mapApiErrorToDomainError(error);
      }
    },
    onSuccess: () => {
      // Invalida listas para refetch automático
      queryClient.invalidateQueries({
        queryKey: estoqueQueryKeys.all,
      });
    },
  });
}
