import { apiCall } from './core';

export async function obterConfiguracaoLoja() {
  return apiCall<any>('/configuracao');
}

export async function atualizarConfiguracaoLoja(dados: any) {
  return apiCall<any>('/configuracao', {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}
