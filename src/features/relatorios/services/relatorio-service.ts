import {
  reportEstoqueAtualRepository,
  reportEstoqueBaixoRepository,
  reportProdutosMaisVendidosRepository,
  reportVendasPorPeriodoRepository
} from "@/data/repositories/relatorio-repository";

export function reportVendasPorPeriodoService() {
  return reportVendasPorPeriodoRepository();
}

export function reportProdutosMaisVendidosService() {
  return reportProdutosMaisVendidosRepository();
}

export function reportEstoqueAtualService() {
  return reportEstoqueAtualRepository();
}

export function reportEstoqueBaixoService() {
  return reportEstoqueBaixoRepository();
}
