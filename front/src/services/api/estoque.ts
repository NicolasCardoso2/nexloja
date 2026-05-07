import { apiCall } from './core';

type ListarEstoqueParams = {
  query?: string;
  categoriaId?: number;
  apenasEstoqueBaixo?: boolean;
};

type ListarMovimentacoesEstoqueParams = {
  produtoId?: number;
};

function toQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function listarEstoque(params?: ListarEstoqueParams & { ativo?: boolean }) {
  const queryString = toQueryString({
    query: params?.query,
    categoriaId: params?.categoriaId,
    apenasEstoqueBaixo: params?.apenasEstoqueBaixo ? true : undefined,
    ativo: params?.ativo
  });
  return apiCall<any[]>(`/estoque${queryString}`);
}

export async function listarMovimentacoesEstoque(params?: ListarMovimentacoesEstoqueParams) {
  const queryString = toQueryString({
    produtoId: params?.produtoId
  });
  return apiCall<any[]>(`/estoque/movimentacoes${queryString}`);
}

export async function registrarMovimentacaoEstoque(dados: any) {
  return apiCall<any>('/estoque/movimentacoes', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}
