import { apiCall } from './core';
import type {
  RelatorioLucroResponse,
  CurvaAbcResponse,
  ReposicaoResponse,
  SazonalidadeResponse,
  SaudeNegocioResponse
} from '@/domain/entities/relatorio';

type RelatorioVendasParams = { dataInicio?: string; dataFim?: string; clienteId?: number; status?: string; formaPagamento?: string };
type RelatorioProdutosParams = { dataInicio?: string; dataFim?: string; categoriaId?: number };

export async function listarRelatorioVendas(params?: RelatorioVendasParams) {
  const qs = new URLSearchParams();
  if (params?.dataInicio) qs.set('dataInicio', params.dataInicio);
  if (params?.dataFim) qs.set('dataFim', params.dataFim);
  if (params?.clienteId) qs.set('clienteId', String(params.clienteId));
  if (params?.status) qs.set('status', params.status);
  if (params?.formaPagamento) qs.set('formaPagamento', params.formaPagamento);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiCall<any>(`/relatorios/vendas${query}`);
}

export async function listarRelatorioProdutos(params?: RelatorioProdutosParams) {
  const qs = new URLSearchParams();
  if (params?.dataInicio) qs.set('dataInicio', params.dataInicio);
  if (params?.dataFim) qs.set('dataFim', params.dataFim);
  if (params?.categoriaId) qs.set('categoriaId', String(params.categoriaId));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiCall<any[]>(`/relatorios/produtos${query}`);
}

export async function listarRelatorioLucro(params?: { dataInicio?: string; dataFim?: string; categoriaId?: number }) {
  const qs = new URLSearchParams();
  if (params?.dataInicio) qs.set('dataInicio', params.dataInicio);
  if (params?.dataFim) qs.set('dataFim', params.dataFim);
  if (params?.categoriaId) qs.set('categoriaId', String(params.categoriaId));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiCall<RelatorioLucroResponse>(`/relatorios/lucro${query}`);
}

export async function listarCurvaAbc(params?: { dataInicio?: string; dataFim?: string }) {
  const qs = new URLSearchParams();
  if (params?.dataInicio) qs.set('dataInicio', params.dataInicio);
  if (params?.dataFim) qs.set('dataFim', params.dataFim);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiCall<CurvaAbcResponse>(`/relatorios/curva-abc${query}`);
}

export async function listarReposicao() {
  return apiCall<ReposicaoResponse>('/relatorios/reposicao');
}

export async function listarSazonalidade() {
  return apiCall<SazonalidadeResponse>('/relatorios/sazonalidade');
}

export async function obterSaudeNegocio() {
  return apiCall<SaudeNegocioResponse>('/relatorios/saude');
}
