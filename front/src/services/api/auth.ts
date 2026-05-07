import { apiCall, setAuthToken } from './core';

export type ApiUsuario = {
  id: number;
  login: string;
  nome: string;
  email?: string;
  perfil: 'ADMIN' | 'VENDEDOR';
};

export async function login(email: string, senha: string) {
  const { token, usuario } = await apiCall<{ token: string; usuario: ApiUsuario }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login: email, senha }),
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

export async function obterMinhaConta() {
  return apiCall<{ usuario: ApiUsuario }>('/auth/me');
}

export async function atualizarMinhaConta(dados: { nome: string; email: string }) {
  const response = await apiCall<{ token: string; usuario: ApiUsuario }>('/auth/conta', {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  setAuthToken(response.token);
  return response;
}

export async function alterarMinhaSenha(dados: { senha_atual: string; nova_senha: string }) {
  return apiCall<{ ok: boolean }>('/auth/senha', {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}
