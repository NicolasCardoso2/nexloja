import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { produtoQueryKeys } from "@/features/produtos/services/produto-query-keys";
import { deactivateProdutoService, getProdutoByIdService } from "@/features/produtos/services/produto-service";
import { ProdutoStatusBadge } from "@/features/produtos/components/produto-status-badge";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function detailPath(routeTemplate: string, id: number): string {
  return routeTemplate.replace(":id", String(id));
}

export function ProdutoDetalhePage(): JSX.Element {
  const { id } = useParams();
  const productId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const produtoQuery = useQuery({
    queryKey: produtoQueryKeys.detail(productId),
    queryFn: () => getProdutoByIdService(productId),
    enabled: Number.isFinite(productId)
  });

  const inativarMutation = useMutation({
    mutationFn: deactivateProdutoService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: produtoQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: produtoQueryKeys.detail(productId) });
    }
  });

  function handleInativar(): void {
    const confirmed = window.confirm("Confirma a inativacao deste produto?");
    if (!confirmed) {
      return;
    }

    inativarMutation.mutate(productId);
  }

  if (produtoQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Carregando produto...</CardContent>
      </Card>
    );
  }

  if (produtoQuery.isError || !produtoQuery.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">Produto nao encontrado.</CardContent>
      </Card>
    );
  }

  const produto = produtoQuery.data;

  return (
    <section className="space-y-4">
      <PageTitle
        title={produto.nome}
        description={`Codigo ${produto.codigo}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(appRoutes.produtos)}>
              Voltar
            </Button>
            <Button variant="outline" onClick={() => navigate(detailPath(appRoutes.produtoEditar, produto.id))}>
              Editar
            </Button>
            <Button variant="destructive" disabled={!produto.ativo || inativarMutation.isPending} onClick={handleInativar}>
              Inativar
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados do produto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <p><strong>Status:</strong> <ProdutoStatusBadge ativo={produto.ativo} /></p>
          <p><strong>Categoria:</strong> {produto.categoria_nome}</p>
          <p><strong>Preco venda:</strong> {formatCurrency(produto.preco_venda)}</p>
          <p><strong>Preco custo:</strong> {formatCurrency(produto.preco_custo)}</p>
          <p><strong>Estoque atual:</strong> {produto.estoque_atual}</p>
          <p><strong>Estoque minimo:</strong> {produto.estoque_minimo}</p>
          <p><strong>Codigo de barras:</strong> {produto.codigo_barras || "-"}</p>
          <p><strong>Marca:</strong> {produto.marca || "-"}</p>
          <p><strong>Unidade:</strong> {produto.unidade}</p>
          <p><strong>Imagem path:</strong> {produto.imagem_path || "-"}</p>
          <p className="md:col-span-2"><strong>Descricao:</strong> {produto.descricao || "-"}</p>
        </CardContent>
      </Card>
    </section>
  );
}
