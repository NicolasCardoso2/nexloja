import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listClientesService } from "@/features/clientes/services/cliente-service";
import { listCategoriasService } from "@/features/produtos/services/categoria-service";
import { RelatorioEstoqueAtualSection } from "@/features/relatorios/components/relatorio-estoque-atual-section";
import { RelatorioEstoqueBaixoSection } from "@/features/relatorios/components/relatorio-estoque-baixo-section";
import { RelatorioProdutosMaisVendidosSection } from "@/features/relatorios/components/relatorio-produtos-mais-vendidos-section";
import { RelatorioTabs } from "@/features/relatorios/components/relatorio-tabs";
import { RelatorioVendasSection } from "@/features/relatorios/components/relatorio-vendas-section";
import { relatoriosQueryKeys } from "@/features/relatorios/services/relatorios-query-keys";
import {
  reportEstoqueAtualService,
  reportEstoqueBaixoService,
  reportProdutosMaisVendidosService,
  reportVendasPorPeriodoService
} from "@/features/relatorios/services/relatorio-service";
import { RelatorioAba } from "@/features/relatorios/types/relatorio-abas";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

export function RelatoriosPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<RelatorioAba>("VENDAS");

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

  const clientesQuery = useQuery({
    queryKey: ["clientes", "relatorios"],
    queryFn: () => listClientesService({})
  });

  const categoriasQuery = useQuery({
    queryKey: ["categorias", "relatorios"],
    queryFn: listCategoriasService
  });

  const vendasQuery = useQuery({
    queryKey: relatoriosQueryKeys.vendas(JSON.stringify(filtrosVendas)),
    queryFn: () =>
      reportVendasPorPeriodoService({
        dataInicio: filtrosVendas.dataInicio || undefined,
        dataFim: filtrosVendas.dataFim || undefined,
        clienteId: filtrosVendas.clienteId ?? undefined,
        status: filtrosVendas.status || undefined,
        formaPagamento: filtrosVendas.formaPagamento || undefined
      }),
    enabled: activeTab === "VENDAS"
  });

  const maisVendidosQuery = useQuery({
    queryKey: relatoriosQueryKeys.produtosMaisVendidos(JSON.stringify(filtrosMaisVendidos)),
    queryFn: () =>
      reportProdutosMaisVendidosService({
        dataInicio: filtrosMaisVendidos.dataInicio || undefined,
        dataFim: filtrosMaisVendidos.dataFim || undefined,
        categoriaId: filtrosMaisVendidos.categoriaId ?? undefined
      }),
    enabled: activeTab === "MAIS_VENDIDOS"
  });

  const estoqueAtualFilters = useMemo(
    () => ({
      query: filtrosEstoqueAtual.query || undefined,
      categoriaId: filtrosEstoqueAtual.categoriaId ?? undefined,
      ativo:
        filtrosEstoqueAtual.ativo === "TODOS"
          ? undefined
          : filtrosEstoqueAtual.ativo === "ATIVO"
            ? true
            : false
    }),
    [filtrosEstoqueAtual]
  );

  const estoqueAtualQuery = useQuery({
    queryKey: relatoriosQueryKeys.estoqueAtual(JSON.stringify(filtrosEstoqueAtual)),
    queryFn: () => reportEstoqueAtualService(estoqueAtualFilters),
    enabled: activeTab === "ESTOQUE_ATUAL"
  });

  const estoqueBaixoQuery = useQuery({
    queryKey: relatoriosQueryKeys.estoqueBaixo(JSON.stringify(filtrosEstoqueBaixo)),
    queryFn: () =>
      reportEstoqueBaixoService({
        query: filtrosEstoqueBaixo.query || undefined,
        categoriaId: filtrosEstoqueBaixo.categoriaId ?? undefined
      }),
    enabled: activeTab === "ESTOQUE_BAIXO"
  });

  function renderActiveSection(): JSX.Element {
    if (activeTab === "VENDAS") {
      if (vendasQuery.isLoading) {
        return <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando relatorio de vendas...</CardContent></Card>;
      }

      if (vendasQuery.isError || !vendasQuery.data) {
        return <Card><CardContent className="p-6 text-sm text-destructive">Erro ao carregar relatorio de vendas.</CardContent></Card>;
      }

      return (
        <RelatorioVendasSection
          data={vendasQuery.data}
          clientes={clientesQuery.data ?? []}
          filtros={filtrosVendas}
          onFiltrosChange={setFiltrosVendas}
        />
      );
    }

    if (activeTab === "MAIS_VENDIDOS") {
      if (maisVendidosQuery.isLoading) {
        return <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando relatorio de produtos mais vendidos...</CardContent></Card>;
      }

      if (maisVendidosQuery.isError || !maisVendidosQuery.data) {
        return <Card><CardContent className="p-6 text-sm text-destructive">Erro ao carregar relatorio de produtos mais vendidos.</CardContent></Card>;
      }

      return (
        <RelatorioProdutosMaisVendidosSection
          itens={maisVendidosQuery.data}
          categorias={categoriasQuery.data ?? []}
          filtros={filtrosMaisVendidos}
          onFiltrosChange={setFiltrosMaisVendidos}
        />
      );
    }

    if (activeTab === "ESTOQUE_ATUAL") {
      if (estoqueAtualQuery.isLoading) {
        return <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando relatorio de estoque atual...</CardContent></Card>;
      }

      if (estoqueAtualQuery.isError || !estoqueAtualQuery.data) {
        return <Card><CardContent className="p-6 text-sm text-destructive">Erro ao carregar relatorio de estoque atual.</CardContent></Card>;
      }

      return (
        <RelatorioEstoqueAtualSection
          itens={estoqueAtualQuery.data}
          categorias={categoriasQuery.data ?? []}
          filtros={filtrosEstoqueAtual}
          onFiltrosChange={setFiltrosEstoqueAtual}
        />
      );
    }

    if (estoqueBaixoQuery.isLoading) {
      return <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando relatorio de estoque baixo...</CardContent></Card>;
    }

    if (estoqueBaixoQuery.isError || !estoqueBaixoQuery.data) {
      return <Card><CardContent className="p-6 text-sm text-destructive">Erro ao carregar relatorio de estoque baixo.</CardContent></Card>;
    }

    return (
      <RelatorioEstoqueBaixoSection
        itens={estoqueBaixoQuery.data}
        categorias={categoriasQuery.data ?? []}
        filtros={filtrosEstoqueBaixo}
        onFiltrosChange={setFiltrosEstoqueBaixo}
      />
    );
  }

  return (
    <section className="space-y-4">
      <PageTitle title="Relatorios" description="Analise vendas e estoque com filtros de operacao." />
      <RelatorioTabs activeTab={activeTab} onChange={setActiveTab} />
      {renderActiveSection()}
    </section>
  );
}
