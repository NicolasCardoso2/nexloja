import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/auth-store";
import { MovimentacaoEstoqueForm } from "@/features/estoque/components/movimentacao-estoque-form";
import { estoqueQueryKeys } from "@/features/estoque/services/estoque-query-keys";
import { listProdutosMovimentacaoService, registrarMovimentacaoEstoqueService } from "@/features/estoque/services/estoque-service";
import { MovimentacaoEstoqueFormValues } from "@/features/estoque/validators/movimentacao-estoque-schema";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";
import { getErrorMessage } from "@/shared/utils/get-error-message";

export function MovimentacaoEstoquePage(): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const usuario = useAuthStore((state) => state.usuario);

  const produtosQuery = useQuery({
    queryKey: estoqueQueryKeys.produtosMovimentacao,
    queryFn: listProdutosMovimentacaoService
  });

  const movimentacaoMutation = useMutation({
    mutationFn: registrarMovimentacaoEstoqueService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: estoqueQueryKeys.all });
      navigate(appRoutes.estoque);
    }
  });

  async function handleSubmit(values: MovimentacaoEstoqueFormValues): Promise<void> {
    if (!usuario) {
      throw new Error("Usuario nao autenticado");
    }

    await movimentacaoMutation.mutateAsync({
      ...values,
      usuario_id: usuario.id
    });
  }

  if (produtosQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Carregando produtos...</CardContent>
      </Card>
    );
  }

  if (produtosQuery.isError) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">Falha ao carregar produtos para movimentacao.</CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <PageTitle
        title="Movimentar Estoque"
        description="Registre entradas, saidas e ajustes com motivo obrigatorio."
        actions={
          <Button variant="outline" onClick={() => navigate(appRoutes.estoque)}>
            Voltar
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <MovimentacaoEstoqueForm
            produtos={produtosQuery.data ?? []}
            isLoading={movimentacaoMutation.isPending}
            errorMessage={movimentacaoMutation.isError ? getErrorMessage(movimentacaoMutation.error, "Falha ao registrar movimentacao.") : undefined}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </section>
  );
}

