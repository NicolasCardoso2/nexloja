export { apiCall, setAuthToken, getAuthToken, clearAuthToken } from './core';
export type { FetchOptions } from './core';

export { login, registrar, obterMinhaConta, atualizarMinhaConta, alterarMinhaSenha } from './auth';
export { listarClientes, obterCliente, criarCliente, atualizarCliente } from './clientes';
export {
  listarProdutos, obterProduto, criarProduto, atualizarProduto,
  listarCategorias, criarCategoria,
} from './produtos';
export { listarVendas, obterVenda, buscarProdutosVenda, criarVenda, cancelarVenda } from './vendas';
export {
  obterSessaoCaixaAtual, abrirCaixa, fecharCaixa,
  listarMovimentacoesCaixa, registrarMovimentacaoCaixa,
} from './caixa';
export { listarEstoque, listarMovimentacoesEstoque, registrarMovimentacaoEstoque } from './estoque';
export { obterConfiguracaoLoja, atualizarConfiguracaoLoja } from './configuracao';
export { obterDashboardResumo } from './dashboard';
export { listarRelatorioVendas, listarRelatorioProdutos, listarRelatorioLucro, listarCurvaAbc, listarReposicao, listarSazonalidade, obterSaudeNegocio } from './relatorios';
