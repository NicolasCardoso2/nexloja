import { apiCall } from './core';

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
