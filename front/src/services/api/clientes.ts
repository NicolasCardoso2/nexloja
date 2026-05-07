import { apiCall } from './core';

type ListarClientesParams = { query?: string; ativo?: boolean };

export async function listarClientes(params?: ListarClientesParams) {
  const qs = new URLSearchParams();
  if (params?.query) qs.set('query', params.query);
  if (params?.ativo !== undefined) qs.set('ativo', String(params.ativo));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiCall<any[]>(`/clientes${query}`);
}

export async function obterCliente(id: number) {
  return apiCall<any>(`/clientes/${id}`);
}

export async function criarCliente(dados: any) {
  return apiCall<any>('/clientes', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function atualizarCliente(id: number, dados: any) {
  return apiCall<any>(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}
