import { apiCall } from './core';

type ListarVendasParams = { dataInicio?: string; dataFim?: string; clienteId?: number; status?: string };

export async function listarVendas(params?: ListarVendasParams) {
  const qs = new URLSearchParams();
  if (params?.dataInicio) qs.set('dataInicio', params.dataInicio);
  if (params?.dataFim) qs.set('dataFim', params.dataFim);
  if (params?.clienteId) qs.set('clienteId', String(params.clienteId));
  if (params?.status) qs.set('status', params.status);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiCall<any[]>(`/vendas${query}`);
}

export async function obterVenda(id: number) {
  return apiCall<any>(`/vendas/${id}`);
}

export async function buscarProdutosVenda(query: string) {
  return apiCall<any[]>(`/vendas/buscar-produtos?query=${encodeURIComponent(query)}`);
}

export async function criarVenda(dados: any) {
  return apiCall<any>('/vendas', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function cancelarVenda(id: number) {
  return apiCall<any>(`/vendas/${id}/cancelar`, {
    method: 'POST',
  });
}
