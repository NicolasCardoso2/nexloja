// src/services/api.ts
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

export interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('auth_token', token);
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('auth_token');
}

export async function apiCall<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (fetchOptions.headers) {
    const existingHeaders = fetchOptions.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  if (!skipAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== AUTENTICAÇÃO ====================
export async function login(email: string, senha: string) {
  const { token, usuario } = await apiCall<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
    skipAuth: true,
  });
  setAuthToken(token);
  return { token, usuario };
}

export async function registrar(nome: string, email: string, senha: string) {
  return apiCall<any>('/auth/registrar', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
    skipAuth: true,
  });
}

// ==================== CLIENTES ====================
export async function listarClientes() {
  return apiCall<any[]>('/clientes');
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

// ==================== PRODUTOS ====================
export async function listarProdutos() {
  return apiCall<any[]>('/produtos');
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

// ==================== CATEGORIAS ====================
export async function listarCategorias() {
  return apiCall<any[]>('/categorias');
}

export async function criarCategoria(nome: string) {
  return apiCall<any>('/categorias', {
    method: 'POST',
    body: JSON.stringify({ nome }),
  });
}

// ==================== VENDAS ====================
export async function listarVendas() {
  return apiCall<any[]>('/vendas');
}

export async function obterVenda(id: number) {
  return apiCall<any>(`/vendas/${id}`);
}

export async function buscarProdutosVenda(query: string) {
  return apiCall<any[]>(`/vendas/buscar-produtos?query=${query}`);
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

// ==================== CAIXA ====================
export async function obterSessaoCaixaAtual() {
  return apiCall<any>('/caixa/sessao-atual');
}

export async function abrirCaixa(dados: any) {
  return apiCall<any>('/caixa/abrir', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function fecharCaixa(dados: any) {
  return apiCall<any>('/caixa/fechar', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function listarMovimentacoesCaixa(caixa_id: number) {
  return apiCall<any[]>(`/caixa/movimentos/${caixa_id}`);
}

export async function registrarMovimentacaoCaixa(dados: any) {
  return apiCall<any>('/caixa/movimentos', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

// ==================== ESTOQUE ====================
export async function listarEstoque() {
  return apiCall<any[]>('/estoque');
}

export async function listarMovimentacoesEstoque() {
  return apiCall<any[]>('/estoque/movimentacoes');
}

export async function registrarMovimentacaoEstoque(dados: any) {
  return apiCall<any>('/estoque/movimentacoes', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

// ==================== CONFIGURAÇÃO ====================
export async function obterConfiguracaoLoja() {
  return apiCall<any>('/configuracao');
}

export async function atualizarConfiguracaoLoja(dados: any) {
  return apiCall<any>('/configuracao', {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

// ==================== DASHBOARD ====================
export async function obterDashboardResumo() {
  return apiCall<any>('/dashboard/resumo');
}

// ==================== RELATÓRIOS ====================
export async function listarRelatorioVendas() {
  return apiCall<any[]>('/relatorios/vendas');
}

export async function listarRelatorioProdutos() {
  return apiCall<any[]>('/relatorios/produtos');
}
