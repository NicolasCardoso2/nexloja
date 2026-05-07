import {
  reportEstoqueAtualRepository,
  reportEstoqueBaixoRepository,
  reportProdutosMaisVendidosRepository,
  reportVendasPorPeriodoRepository,
  reportLucroRepository,
  reportCurvaAbcRepository,
  reportReposicaoRepository,
  reportSazonalidadeRepository,
  reportSaudeNegocioRepository
} from "@/data/repositories/relatorio-repository";

export function reportVendasPorPeriodoService(params?: { dataInicio?: string; dataFim?: string; clienteId?: number; status?: string; formaPagamento?: string }) {
  return reportVendasPorPeriodoRepository(params);
}

export function reportProdutosMaisVendidosService(params?: { dataInicio?: string; dataFim?: string; categoriaId?: number }) {
  return reportProdutosMaisVendidosRepository(params);
}

export function reportEstoqueAtualService(params?: { query?: string; categoriaId?: number; ativo?: boolean }) {
  return reportEstoqueAtualRepository(params);
}

export function reportEstoqueBaixoService(params?: { query?: string; categoriaId?: number }) {
  return reportEstoqueBaixoRepository(params);
}

export function reportLucroService(params?: { dataInicio?: string; dataFim?: string; categoriaId?: number }) {
  return reportLucroRepository(params);
}

export function reportCurvaAbcService(params?: { dataInicio?: string; dataFim?: string }) {
  return reportCurvaAbcRepository(params);
}

export function reportReposicaoService() {
  return reportReposicaoRepository();
}

export function reportSazonalidadeService() {
  return reportSazonalidadeRepository();
}

export function reportSaudeNegocioService() {
  return reportSaudeNegocioRepository();
}
