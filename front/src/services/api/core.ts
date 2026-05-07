// Aqui é onde todas as chamadas ao backend passam.
// Se você precisa fazer uma requisição HTTP em qualquer parte do app,
// usa a função apiCall() daqui ela já cuida do token e dos erros.
//
// URL padrão: http://localhost:3001/api
// (pode mudar via VITE_API_URL no .env)

import { useAuthStore } from "@/app/store/auth-store";

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

export interface FetchOptions extends RequestInit {
  /** Quando true, não envia o header Authorization (usado no login) */
  skipAuth?: boolean;
}

// Token fica em memória durante o uso e no localStorage para não perder
// quando o usuário fechar e abrir o app de novo
let authToken: string | null = localStorage.getItem('auth_token');

// Chama isso depois que o login funcionar
export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('auth_token', token);
}

// Raramente usado direto, mas deixa disponível se precisar
export function getAuthToken() {
  return authToken;
}

// Limpa tudo chamado no logout ou quando o servidor retorna 401
export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('auth_token');
}

// Função principal chama o backend e já trata os erros comuns.
// Exemplos de uso:
//   apiCall('/produtos')                   GET lista de produtos
//   apiCall('/vendas', { method: 'POST' }) cria uma venda
//   apiCall('/login', { skipAuth: true })  não envia o token (login ainda não tem token)
export async function apiCall<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Coloca o token no header de todas as rotas (exceto login)
  if (!skipAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const isFileProtocol = window.location.protocol === 'file:';
  const loginPath = isFileProtocol ? '/#/login' : '/login';
  const isOnLogin = isFileProtocol
    ? window.location.hash === '#/login'
    : window.location.pathname === '/login';

  // Se o servidor reclamar que o token não presta, desloga e manda pro login
  if (response.status === 401) {
    clearAuthToken();
    useAuthStore.getState().sair();
    if (!isOnLogin) {
      window.location.replace(loginPath);
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
