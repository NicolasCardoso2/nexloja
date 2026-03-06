import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { ProdutoForm } from "@/features/produtos/components/produto-form";
import { listCategoriasService } from "@/features/produtos/services/categoria-service";
import { produtoQueryKeys } from "@/features/produtos/services/produto-query-keys";
import { createProdutoService, getProdutoByIdService, updateProdutoService } from "@/features/produtos/services/produto-service";
import { ProdutoFormValues } from "@/features/produtos/validators/produto-schema";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

const defaultValues: ProdutoFormValues = {
  codigo: "",
  nome: "",
  categoria_id: 0,
  preco_venda: 0,
  estoque_atual: 0,
  estoque_minimo: 0,
  ativo: true,
  codigo_barras: "",
  descricao: "",
  marca: "",
  preco_custo: 0,
  unidade: "UN",
  imagem_path: ""
};

function toFormValues(product: Awaited<ReturnType<typeof getProdutoByIdService>>): ProdutoFormValues {
  return {
    codigo: product.codigo,
    nome: product.nome,
    categoria_id: product.categoria_id,
    preco_venda: product.preco_venda,
    estoque_atual: product.estoque_atual,
    estoque_minimo: product.estoque_minimo,
    ativo: product.ativo,
    codigo_barras: product.codigo_barras ?? "",
    descricao: product.descricao ?? "",
    marca: product.marca ?? "",
    preco_custo: product.preco_custo,
    unidade: product.unidade ?? "UN",
    imagem_path: product.imagem_path ?? ""
  };
}

export function ProdutoFormPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productId = id ? Number(id) : null;
  const isEdit = Boolean(productId);

  const categoriasQuery = useQuery({
    queryKey: produtoQueryKeys.categorias,
    queryFn: listCategoriasService
  });

  const produtoQuery = useQuery({
    queryKey: productId ? produtoQueryKeys.detail(productId) : ["produtos", "detail", "new"],
    queryFn: () => getProdutoByIdService(productId as number),
    enabled: isEdit
  });

  const createMutation = useMutation({
    mutationFn: createProdutoService,
    onSuccess: async (createdId) => {
      await queryClient.invalidateQueries({ queryKey: produtoQueryKeys.all });
      navigate(appRoutes.produtoDetalhe.replace(":id", String(createdId)));
    }
  });

  const updateMutation = useMutation({
    mutationFn: (values: ProdutoFormValues) => updateProdutoService(productId as number, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: produtoQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: produtoQueryKeys.detail(productId as number) });
      navigate(appRoutes.produtoDetalhe.replace(":id", String(productId)));
    }
  });

  const currentValues = useMemo(() => {
    if (isEdit && produtoQuery.data) {
      return toFormValues(produtoQuery.data);
    }

    return defaultValues;
  }, [isEdit, produtoQuery.data]);

  async function handleSubmit(values: ProdutoFormValues): Promise<void> {
    if (isEdit) {
      await updateMutation.mutateAsync(values);
      return;
    }

    await createMutation.mutateAsync(values);
  }

  if (categoriasQuery.isLoading || (isEdit && produtoQuery.isLoading)) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Carregando formulario...</CardContent>
      </Card>
    );
  }

  if (categoriasQuery.isError || (isEdit && produtoQuery.isError)) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">Falha ao carregar dados do formulario.</CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <PageTitle
        title={isEdit ? "Editar Produto" : "Novo Produto"}
        description="Preencha os dados obrigatorios e opcionais do produto."
      />

      <Card>
        <CardContent className="p-6">
          <ProdutoForm
            defaultValues={currentValues}
            categorias={categoriasQuery.data ?? []}
            isLoading={createMutation.isPending || updateMutation.isPending}
            submitLabel={isEdit ? "Salvar alteracoes" : "Cadastrar produto"}
            errorMessage={
              createMutation.isError || updateMutation.isError
                ? "Falha ao salvar produto. Verifique os dados informados."
                : undefined
            }
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </section>
  );
}
