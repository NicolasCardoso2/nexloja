import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { listCategoriasService } from "@/features/produtos/services/categoria-service";
import { produtoQueryKeys } from "@/features/produtos/services/produto-query-keys";
import { deactivateProdutoService, listProdutosService } from "@/features/produtos/services/produto-service";
import { ProdutoListState, serializeProdutoFilters, toProdutoFilters } from "@/features/produtos/types/produto-filters";
import { ProdutosFilters } from "@/features/produtos/components/produtos-filters";
import { ProdutosTable } from "@/features/produtos/components/produtos-table";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

const defaultFilters: ProdutoListState = {
  query: "",
  categoriaId: null,
  status: "TODOS"
};

function productPath(routeTemplate: string, id: number): string {
  return routeTemplate.replace(":id", String(id));
}

export function ProdutosPage(): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filtersState, setFiltersState] = useState<ProdutoListState>(defaultFilters);
  const filters = useMemo(() => toProdutoFilters(filtersState), [filtersState]);

  const categoriasQuery = useQuery({
    queryKey: produtoQueryKeys.categorias,
    queryFn: listCategoriasService
  });

  const produtosQuery = useQuery({
    queryKey: produtoQueryKeys.list(serializeProdutoFilters(filtersState)),
    queryFn: () => listProdutosService(filters)
  });

  const inativarMutation = useMutation({
    mutationFn: deactivateProdutoService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: produtoQueryKeys.all });
    }
  });

  function handleInativar(id: number): void {
    const confirmed = window.confirm("Confirma a inativacao deste produto?");
    if (!confirmed) {
      return;
    }

    inativarMutation.mutate(id);
  }

  return (
    <section className="space-y-4">
      <PageTitle
        title="Produtos"
        description="Gerencie cadastro, status e estoque inicial dos produtos."
        actions={<Button onClick={() => navigate(appRoutes.produtoNovo)}>Novo produto</Button>}
      />

      <ProdutosFilters
        value={filtersState}
        categorias={categoriasQuery.data ?? []}
        onChange={setFiltersState}
        onClear={() => setFiltersState(defaultFilters)}
      />

      {produtosQuery.isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Carregando produtos...</CardContent>
        </Card>
      ) : null}

      {produtosQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Erro ao carregar produtos.</CardContent>
        </Card>
      ) : null}

      {produtosQuery.data && produtosQuery.data.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Nenhum produto encontrado para os filtros aplicados.</CardContent>
        </Card>
      ) : null}

      {produtosQuery.data && produtosQuery.data.length > 0 ? (
        <ProdutosTable
          produtos={produtosQuery.data}
          isInativando={inativarMutation.isPending}
          onVisualizar={(id) => navigate(productPath(appRoutes.produtoDetalhe, id))}
          onEditar={(id) => navigate(productPath(appRoutes.produtoEditar, id))}
          onInativar={handleInativar}
        />
      ) : null}
    </section>
  );
}
