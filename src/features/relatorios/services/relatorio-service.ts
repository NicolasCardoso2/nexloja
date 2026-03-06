import {
  reportEstoqueAtualRepository,
  reportEstoqueBaixoRepository,
  reportProdutosMaisVendidosRepository,
  reportVendasPorPeriodoRepository
} from "@/data/repositories/relatorio-repository";
import {
  RelatorioEstoqueBaixoFilters,
  RelatorioEstoqueFilters,
  RelatorioProdutosVendidosFilters,
  RelatorioVendasFilters
} from "@/domain/entities/relatorio";

export function reportVendasPorPeriodoService(filters: RelatorioVendasFilters) {
  return reportVendasPorPeriodoRepository(filters);
}

export function reportProdutosMaisVendidosService(filters: RelatorioProdutosVendidosFilters) {
  return reportProdutosMaisVendidosRepository(filters);
}

export function reportEstoqueAtualService(filters: RelatorioEstoqueFilters) {
  return reportEstoqueAtualRepository(filters);
}

export function reportEstoqueBaixoService(filters: RelatorioEstoqueBaixoFilters) {
  return reportEstoqueBaixoRepository(filters);
}
