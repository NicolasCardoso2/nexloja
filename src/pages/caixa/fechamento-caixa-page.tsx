import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/auth-store";
import { CaixaMovimentosTable } from "@/features/caixa/components/caixa-movimentos-table";
import { CaixaSessaoResumo } from "@/features/caixa/components/caixa-sessao-resumo";
import { FechamentoCaixaForm } from "@/features/caixa/components/fechamento-caixa-form";
import { caixaQueryKeys } from "@/features/caixa/services/caixa-query-keys";
import { fecharCaixaService, getCaixaAtualService, listMovimentosCaixaService } from "@/features/caixa/services/caixa-service";
import { FechamentoCaixaFormValues } from "@/features/caixa/validators/fechamento-caixa-schema";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";
import { getErrorMessage } from "@/shared/utils/get-error-message";

export function FechamentoCaixaPage(): JSX.Element {
  const usuario = useAuthStore((state) => state.usuario);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const sessaoAtualQuery = useQuery({
    queryKey: caixaQueryKeys.sessaoAtual(usuario?.id ?? 0),
    queryFn: () => getCaixaAtualService(usuario!.id),
    enabled: Boolean(usuario)
  });

  const movimentosQuery = useQuery({
    queryKey: caixaQueryKeys.movimentos(sessaoAtualQuery.data?.id ?? 0),
    queryFn: () => listMovimentosCaixaService(sessaoAtualQuery.data!.id),
    enabled: Boolean(sessaoAtualQuery.data?.id)
  });

  const fecharMutation = useMutation({
    mutationFn: fecharCaixaService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: caixaQueryKeys.all });
      navigate(appRoutes.caixaAbrir);
    }
  });

  async function handleSubmit(values: FechamentoCaixaFormValues): Promise<void> {
    if (!usuario) {
      throw new Error("Usuario nao autenticado");
    }

    await fecharMutation.mutateAsync({
      usuario_id: usuario.id,
      valor_final_informado: values.valor_final_informado,
      observacoes: values.observacoes
    });
  }

  return (
    <section className="space-y-4">
      <PageTitle title="Fechar Caixa" description="Encerre a sessao atual de caixa com conferencia de valores." />

      {sessaoAtualQuery.isLoading ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Consultando sessao atual...</CardContent></Card>
      ) : null}

      {sessaoAtualQuery.isError ? (
        <Card><CardContent className="p-6 text-sm text-destructive">Falha ao consultar sessao atual.</CardContent></Card>
      ) : null}

      {!sessaoAtualQuery.data && !sessaoAtualQuery.isLoading ? (
        <Card>
          <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
            <p>Nao existe sessao de caixa aberta para este usuario.</p>
            <Button variant="outline" onClick={() => navigate(appRoutes.caixaAbrir)}>
              Ir para abertura de caixa
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {sessaoAtualQuery.data ? (
        <>
          <CaixaSessaoResumo sessao={sessaoAtualQuery.data} />

          {movimentosQuery.isLoading ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando movimentos...</CardContent></Card>
          ) : null}

          {movimentosQuery.isError ? (
            <Card><CardContent className="p-6 text-sm text-destructive">Falha ao carregar movimentos do caixa.</CardContent></Card>
          ) : null}

          {movimentosQuery.data && movimentosQuery.data.length > 0 ? (
            <CaixaMovimentosTable movimentos={movimentosQuery.data} />
          ) : null}

          <Card>
            <CardContent className="p-6">
              <FechamentoCaixaForm
                sessao={sessaoAtualQuery.data}
                isLoading={fecharMutation.isPending}
                errorMessage={fecharMutation.isError ? getErrorMessage(fecharMutation.error, "Falha ao fechar caixa.") : undefined}
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </section>
  );
}

