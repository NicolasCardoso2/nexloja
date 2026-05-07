import { apiCall } from './core';

type ListarProdutosParams = { query?: string; categoriaId?: number; ativo?: boolean };

export async function listarProdutos(params?: ListarProdutosParams) {
  const qs = new URLSearchParams();
  if (params?.query) qs.set('query', params.query);
  if (params?.categoriaId) qs.set('categoriaId', String(params.categoriaId));
  if (params?.ativo !== undefined) qs.set('ativo', String(params.ativo));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiCall<any[]>(`/produtos${query}`);
}

export async function obterProduto(id: number) {
  return apiCall<any>(`/produtos/${id}`);
}

export async function criarProduto(dados: any) {
  return apiCall<any>('/produtos', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function atualizarProduto(id: number, dados: any) {
  return apiCall<any>(`/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export async function listarCategorias() {
  return apiCall<any[]>('/categorias');
}

export async function criarCategoria(nome: string) {
  return apiCall<any>('/categorias', {
    method: 'POST',
    body: JSON.stringify({ nome }),
  });
}
