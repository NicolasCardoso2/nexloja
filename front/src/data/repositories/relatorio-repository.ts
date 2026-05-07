import { listarEstoque, listarRelatorioVendas, listarRelatorioProdutos, listarRelatorioLucro, listarCurvaAbc, listarReposicao, listarSazonalidade, obterSaudeNegocio } from "@/services/api";
import {
  RelatorioEstoqueBaixoItem,
  RelatorioEstoqueItem,
  RelatorioProdutoMaisVendido,
  RelatorioVendasResponse,
  RelatorioLucroResponse,
  CurvaAbcResponse,
  ReposicaoResponse,
  SazonalidadeResponse,
  SaudeNegocioResponse
} from "@/domain/entities/relatorio";

type RelatorioVendasParams = { dataInicio?: string; dataFim?: string; clienteId?: number; status?: string; formaPagamento?: string };
type RelatorioProdutosParams = { dataInicio?: string; dataFim?: string; categoriaId?: number };
type EstoqueRelatorioParams = { query?: string; categoriaId?: number; ativo?: boolean };

export async function reportVendasPorPeriodoRepository(params?: RelatorioVendasParams): Promise<RelatorioVendasResponse> {
  return listarRelatorioVendas(params);
}

export async function reportProdutosMaisVendidosRepository(params?: RelatorioProdutosParams): Promise<RelatorioProdutoMaisVendido[]> {
  return listarRelatorioProdutos(params);
}

export async function reportEstoqueAtualRepository(params?: EstoqueRelatorioParams): Promise<RelatorioEstoqueItem[]> {
  const items = await listarEstoque(params);
  return items.map((item: any) => ({
    codigo: item.codigo,
    produto_nome: item.nome,
    categoria_nome: item.categoria_nome,
    estoque_atual: Number(item.estoque_atual ?? 0),
    estoque_minimo: Number(item.estoque_minimo ?? 0),
    status_estoque: item.status_estoque,
    ativo: Boolean(item.ativo)
  }));
}

export async function reportEstoqueBaixoRepository(params?: Omit<EstoqueRelatorioParams, 'ativo'>): Promise<RelatorioEstoqueBaixoItem[]> {
  const items = await listarEstoque({ ...params, apenasEstoqueBaixo: true });
  return items
    .filter((item: any) => item.status_estoque === 'BAIXO' || item.status_estoque === 'ZERADO')
    .map((item: any) => {
      const estoqueAtual = Number(item.estoque_atual ?? 0);
      const estoqueMinimo = Number(item.estoque_minimo ?? 0);
      return {
        codigo: item.codigo,
        produto_nome: item.nome,
        categoria_nome: item.categoria_nome,
        estoque_atual: estoqueAtual,
        estoque_minimo: estoqueMinimo,
        diferenca_reposicao: Math.max(0, estoqueMinimo - estoqueAtual),
        status_estoque: item.status_estoque
      };
    });
}

export async function reportLucroRepository(params?: { dataInicio?: string; dataFim?: string; categoriaId?: number }): Promise<RelatorioLucroResponse> {
  return listarRelatorioLucro(params);
}

export async function reportCurvaAbcRepository(params?: { dataInicio?: string; dataFim?: string }): Promise<CurvaAbcResponse> {
  return listarCurvaAbc(params);
}

export async function reportReposicaoRepository(): Promise<ReposicaoResponse> {
  return listarReposicao();
}

export async function reportSazonalidadeRepository(): Promise<SazonalidadeResponse> {
  return listarSazonalidade();
}

export async function reportSaudeNegocioRepository(): Promise<SaudeNegocioResponse> {
  return obterSaudeNegocio();
}
