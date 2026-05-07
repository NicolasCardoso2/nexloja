import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listClientesService } from "@/features/clientes/services/cliente-service";
import { listCategoriasService } from "@/features/produtos/services/categoria-service";
import { RelatorioEstoqueAtualSection } from "@/features/relatorios/components/relatorio-estoque-atual-section";
import { RelatorioEstoqueBaixoSection } from "@/features/relatorios/components/relatorio-estoque-baixo-section";
import { RelatorioProdutosMaisVendidosSection } from "@/features/relatorios/components/relatorio-produtos-mais-vendidos-section";
import { RelatorioTabs } from "@/features/relatorios/components/relatorio-tabs";
import { RelatorioVendasSection } from "@/features/relatorios/components/relatorio-vendas-section";
import { RelatorioLucroSection } from "@/features/relatorios/components/relatorio-lucro-section";
import { RelatorioCurvaAbcSection } from "@/features/relatorios/components/relatorio-curva-abc-section";
import { RelatorioReposicaoSection } from "@/features/relatorios/components/relatorio-reposicao-section";
import { RelatorioSazonalidadeSection } from "@/features/relatorios/components/relatorio-sazonalidade-section";
import { RelatorioSaudeSection } from "@/features/relatorios/components/relatorio-saude-section";
import { relatoriosQueryKeys } from "@/features/relatorios/services/relatorios-query-keys";
import {
  reportEstoqueAtualService,
  reportEstoqueBaixoService,
  reportProdutosMaisVendidosService,
  reportVendasPorPeriodoService,
  reportLucroService,
  reportCurvaAbcService,
  reportReposicaoService,
  reportSazonalidadeService,
  reportSaudeNegocioService
} from "@/features/relatorios/services/relatorio-service";
import { RelatorioAba } from "@/features/relatorios/types/relatorio-abas";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

export function RelatoriosPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<RelatorioAba>("SAUDE");

  const [filtrosVendas, setFiltrosVendas] = useState({
    dataInicio: "",
    dataFim: "",
    clienteId: null as number | null,
    status: "" as "" | "FINALIZADA" | "CANCELADA",
    formaPagamento: "" as "" | "DINHEIRO" | "PIX" | "CARTAO_DEBITO" | "CARTAO_CREDITO"
  });

  const [filtrosMaisVendidos, setFiltrosMaisVendidos] = useState({
    dataInicio: "",
    dataFim: "",
    categoriaId: null as number | null
  });

  const [filtrosEstoqueAtual, setFiltrosEstoqueAtual] = useState({
    query: "",
    categoriaId: null as number | null,
    ativo: "TODOS" as "TODOS" | "ATIVO" | "INATIVO"
  });

  const [filtrosEstoqueBaixo, setFiltrosEstoqueBaixo] = useState({
    query: "",
    categoriaId: null as number | null
  });

  const [filtrosLucro, setFiltrosLucro] = useState({
    dataInicio: "",
    dataFim: "",
    categoriaId: null as number | null
  });

  const [filtrosCurvaAbc, setFiltrosCurvaAbc] = useState({
    dataInicio: "",
    dataFim: ""
  });

  const vendassKey = useMemo(() => JSON.stringify(filtrosVendas), [filtrosVendas]);
  const maisVendidosKey = useMemo(() => JSON.stringify(filtrosMaisVendidos), [filtrosMaisVendidos]);
  const estoqueAtualKey = useMemo(() => JSON.stringify(filtrosEstoqueAtual), [filtrosEstoqueAtual]);
  const estoqueBaixoKey = useMemo(() => JSON.stringify(filtrosEstoqueBaixo), [filtrosEstoqueBaixo]);
  const lucroKey = useMemo(() => JSON.stringify(filtrosLucro), [filtrosLucro]);
  const curvaAbcKey = useMemo(() => JSON.stringify(filtrosCurvaAbc), [filtrosCurvaAbc]);

  const clientesQuery = useQuery({
    queryKey: ["clientes", "relatorios"],
    queryFn: () => listClientesService(),
    staleTime: 5 * 60 * 1000
  });

  const categoriasQuery = useQuery({
    queryKey: ["categorias", "relatorios"],
    queryFn: listCategoriasService,
    staleTime: 5 * 60 * 1000
  });

  const vendasQuery = useQuery({
    queryKey: relatoriosQueryKeys.vendas(vendassKey),
    queryFn: () => reportVendasPorPeriodoService({
      dataInicio: filtrosVendas.dataInicio || undefined,
      dataFim: filtrosVendas.dataFim || undefined,
      clienteId: filtrosVendas.clienteId ?? undefined,
      status: filtrosVendas.status || undefined,
      formaPagamento: filtrosVendas.formaPagamento || undefined
    }),
    enabled: activeTab === "VENDAS",
    staleTime: 5 * 60 * 1000
  });

  const maisVendidosQuery = useQuery({
    queryKey: relatoriosQueryKeys.produtosMaisVendidos(maisVendidosKey),
    queryFn: () => reportProdutosMaisVendidosService({
      dataInicio: filtrosMaisVendidos.dataInicio || undefined,
      dataFim: filtrosMaisVendidos.dataFim || undefined,
      categoriaId: filtrosMaisVendidos.categoriaId ?? undefined
    }),
    enabled: activeTab === "MAIS_VENDIDOS",
    staleTime: 5 * 60 * 1000
  });

  const estoqueAtualQuery = useQuery({
    queryKey: relatoriosQueryKeys.estoqueAtual(estoqueAtualKey),
    queryFn: () => reportEstoqueAtualService({
      query: filtrosEstoqueAtual.query || undefined,
      categoriaId: filtrosEstoqueAtual.categoriaId ?? undefined,
      ativo: filtrosEstoqueAtual.ativo === 'TODOS' ? undefined : filtrosEstoqueAtual.ativo === 'ATIVO'
    }),
    enabled: activeTab === "ESTOQUE_ATUAL",
    staleTime: 5 * 60 * 1000
  });

  const estoqueBaixoQuery = useQuery({
    queryKey: relatoriosQueryKeys.estoqueBaixo(estoqueBaixoKey),
    queryFn: () => reportEstoqueBaixoService({
      query: filtrosEstoqueBaixo.query || undefined,
      categoriaId: filtrosEstoqueBaixo.categoriaId ?? undefined
    }),
    enabled: activeTab === "ESTOQUE_BAIXO",
    staleTime: 5 * 60 * 1000
  });

  const lucroQuery = useQuery({
    queryKey: relatoriosQueryKeys.lucro(lucroKey),
    queryFn: () => reportLucroService({ dataInicio: filtrosLucro.dataInicio || undefined, dataFim: filtrosLucro.dataFim || undefined, categoriaId: filtrosLucro.categoriaId ?? undefined }),
    enabled: activeTab === "LUCRO",
    staleTime: 5 * 60 * 1000
  });

  const curvaAbcQuery = useQuery({
    queryKey: relatoriosQueryKeys.curvaAbc(curvaAbcKey),
    queryFn: () => reportCurvaAbcService({ dataInicio: filtrosCurvaAbc.dataInicio || undefined, dataFim: filtrosCurvaAbc.dataFim || undefined }),
    enabled: activeTab === "CURVA_ABC",
    staleTime: 5 * 60 * 1000
  });

  const reposicaoQuery = useQuery({
    queryKey: relatoriosQueryKeys.reposicao(),
    queryFn: reportReposicaoService,
    enabled: activeTab === "REPOSICAO",
    staleTime: 5 * 60 * 1000
  });

  const sazonalidadeQuery = useQuery({
    queryKey: relatoriosQueryKeys.sazonalidade(),
    queryFn: reportSazonalidadeService,
    enabled: activeTab === "SAZONALIDADE",
    staleTime: 5 * 60 * 1000
  });

  const saudeQuery = useQuery({
    queryKey: relatoriosQueryKeys.saude(),
    queryFn: reportSaudeNegocioService,
    enabled: activeTab === "SAUDE",
    staleTime: 60 * 1000
  });

  function loadingCard(msg: string) {
    return <Card><CardContent className="p-6 text-sm text-muted-foreground">{msg}</CardContent></Card>;
  }

  function errorCard(msg: string) {
    return <Card><CardContent className="p-6 text-sm text-destructive">{msg}</CardContent></Card>;
  }

  function renderActiveSection(): JSX.Element {
    if (activeTab === "SAUDE") {
      if (saudeQuery.isLoading) return loadingCard("Carregando saude do negocio...");
      if (saudeQuery.isError || !saudeQuery.data) return errorCard("Erro ao carregar saude do negocio.");
      return <RelatorioSaudeSection data={saudeQuery.data} />;
    }

    if (activeTab === "LUCRO") {
      if (lucroQuery.isLoading) return loadingCard("Carregando painel de lucro...");
      if (lucroQuery.isError || !lucroQuery.data) return errorCard("Erro ao carregar painel de lucro.");
      return <RelatorioLucroSection data={lucroQuery.data} categorias={categoriasQuery.data ?? []} filtros={filtrosLucro} onFiltrosChange={setFiltrosLucro} />;
    }

    if (activeTab === "CURVA_ABC") {
      if (curvaAbcQuery.isLoading) return loadingCard("Carregando curva ABC...");
      if (curvaAbcQuery.isError || !curvaAbcQuery.data) return errorCard("Erro ao carregar curva ABC.");
      return <RelatorioCurvaAbcSection data={curvaAbcQuery.data} filtros={filtrosCurvaAbc} onFiltrosChange={setFiltrosCurvaAbc} />;
    }

    if (activeTab === "REPOSICAO") {
      if (reposicaoQuery.isLoading) return loadingCard("Carregando sugestoes de reposicao...");
      if (reposicaoQuery.isError || !reposicaoQuery.data) return errorCard("Erro ao carregar reposicao.");
      return <RelatorioReposicaoSection data={reposicaoQuery.data} />;
    }

    if (activeTab === "SAZONALIDADE") {
      if (sazonalidadeQuery.isLoading) return loadingCard("Carregando sazonalidade...");
      if (sazonalidadeQuery.isError || !sazonalidadeQuery.data) return errorCard("Erro ao carregar sazonalidade.");
      return <RelatorioSazonalidadeSection data={sazonalidadeQuery.data} />;
    }

    if (activeTab === "VENDAS") {
      if (vendasQuery.isLoading) return loadingCard("Carregando relatorio de vendas...");
      if (vendasQuery.isError || !vendasQuery.data) return errorCard("Erro ao carregar relatorio de vendas.");
      return <RelatorioVendasSection data={vendasQuery.data} clientes={clientesQuery.data ?? []} filtros={filtrosVendas} onFiltrosChange={setFiltrosVendas} />;
    }

    if (activeTab === "MAIS_VENDIDOS") {
      if (maisVendidosQuery.isLoading) return loadingCard("Carregando relatorio de produtos mais vendidos...");
      if (maisVendidosQuery.isError || !maisVendidosQuery.data) return errorCard("Erro ao carregar relatorio de produtos mais vendidos.");
      return <RelatorioProdutosMaisVendidosSection itens={maisVendidosQuery.data} categorias={categoriasQuery.data ?? []} filtros={filtrosMaisVendidos} onFiltrosChange={setFiltrosMaisVendidos} />;
    }

    if (activeTab === "ESTOQUE_ATUAL") {
      if (estoqueAtualQuery.isLoading) return loadingCard("Carregando relatorio de estoque atual...");
      if (estoqueAtualQuery.isError || !estoqueAtualQuery.data) return errorCard("Erro ao carregar relatorio de estoque atual.");
      return <RelatorioEstoqueAtualSection itens={estoqueAtualQuery.data} categorias={categoriasQuery.data ?? []} filtros={filtrosEstoqueAtual} onFiltrosChange={setFiltrosEstoqueAtual} />;
    }

    if (estoqueBaixoQuery.isLoading) return loadingCard("Carregando relatorio de estoque baixo...");
    if (estoqueBaixoQuery.isError || !estoqueBaixoQuery.data) return errorCard("Erro ao carregar relatorio de estoque baixo.");
    return <RelatorioEstoqueBaixoSection itens={estoqueBaixoQuery.data} categorias={categoriasQuery.data ?? []} filtros={filtrosEstoqueBaixo} onFiltrosChange={setFiltrosEstoqueBaixo} />;
  }

  return (
    <section className="space-y-4">
      <PageTitle title="Relatorios" description="Lucro real, curva ABC, reposicao inteligente e sazonalidade do mercadinho." />
      <RelatorioTabs activeTab={activeTab} onChange={setActiveTab} />
      {renderActiveSection()}
    </section>
  );
}
