import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { EstoqueFilters } from "@/features/estoque/components/estoque-filters";
import { EstoqueTable } from "@/features/estoque/components/estoque-table";
import { MovimentacoesEstoqueTable } from "@/features/estoque/components/movimentacoes-estoque-table";
import { estoqueQueryKeys } from "@/features/estoque/services/estoque-query-keys";
import {
  listEstoqueService,
  listMovimentacoesEstoqueService,
  listProdutosMovimentacaoService
} from "@/features/estoque/services/estoque-service";
import {
  EstoqueListState,
  serializeEstoqueState,
  toEstoqueFilters,
  toMovimentacaoFilters
} from "@/features/estoque/types/estoque-filters";
import { listCategoriasService } from "@/features/produtos/services/categoria-service";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

const defaultFilters: EstoqueListState = {
  query: "",
  categoriaId: null,
  apenasEstoqueBaixo: false,
  produtoHistoricoId: null
};

export function EstoquePage(): JSX.Element {
  const navigate = useNavigate();
  const [filtersState, setFiltersState] = useState<EstoqueListState>(defaultFilters);

  const estoqueFilters = useMemo(() => toEstoqueFilters(filtersState), [filtersState]);
  const movimentacaoFilters = useMemo(() => toMovimentacaoFilters(filtersState), [filtersState]);

  const categoriasQuery = useQuery({
    queryKey: ["categorias", "estoque"],
    queryFn: listCategoriasService
  });

  const produtosMovimentacaoQuery = useQuery({
    queryKey: estoqueQueryKeys.produtosMovimentacao,
    queryFn: listProdutosMovimentacaoService
  });

  const estoqueQuery = useQuery({
    queryKey: estoqueQueryKeys.list(serializeEstoqueState(filtersState)),
    queryFn: () => listEstoqueService(estoqueFilters)
  });

  const movimentacoesQuery = useQuery({
    queryKey: estoqueQueryKeys.movimentacoes(JSON.stringify(movimentacaoFilters)),
    queryFn: () => listMovimentacoesEstoqueService(movimentacaoFilters)
  });

  return (
    <section className="space-y-4">
      <PageTitle
        title="Estoque"
        description="Controle de saldos, filtros e historico de movimentacoes."
        actions={<Button onClick={() => navigate(appRoutes.estoqueMovimentar)}>Movimentar estoque</Button>}
      />

      <EstoqueFilters
        value={filtersState}
        categorias={categoriasQuery.data ?? []}
        produtos={produtosMovimentacaoQuery.data ?? []}
        onChange={setFiltersState}
        onClear={() => setFiltersState(defaultFilters)}
      />

      {estoqueQuery.isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Carregando estoque...</CardContent>
        </Card>
      ) : null}

      {estoqueQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Erro ao carregar estoque.</CardContent>
        </Card>
      ) : null}

      {estoqueQuery.data && estoqueQuery.data.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Nenhum produto encontrado para os filtros aplicados.</CardContent>
        </Card>
      ) : null}

      {estoqueQuery.data && estoqueQuery.data.length > 0 ? <EstoqueTable items={estoqueQuery.data} /> : null}

      <PageTitle title="Historico de movimentacoes" description="Movimentacoes mais recentes registradas no sistema." />

      {movimentacoesQuery.isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Carregando historico...</CardContent>
        </Card>
      ) : null}

      {movimentacoesQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Erro ao carregar historico de movimentacoes.</CardContent>
        </Card>
      ) : null}

      {movimentacoesQuery.data && movimentacoesQuery.data.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Nenhuma movimentacao registrada.</CardContent>
        </Card>
      ) : null}

      {movimentacoesQuery.data && movimentacoesQuery.data.length > 0 ? (
        <MovimentacoesEstoqueTable items={movimentacoesQuery.data} />
      ) : null}
    </section>
  );
}
