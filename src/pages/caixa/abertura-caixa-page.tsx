import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store/auth-store";
import { AberturaCaixaForm } from "@/features/caixa/components/abertura-caixa-form";
import { CaixaMovimentosTable } from "@/features/caixa/components/caixa-movimentos-table";
import { CaixaSessaoResumo } from "@/features/caixa/components/caixa-sessao-resumo";
import { caixaQueryKeys } from "@/features/caixa/services/caixa-query-keys";
import { abrirCaixaService, getCaixaAtualService, listMovimentosCaixaService } from "@/features/caixa/services/caixa-service";
import { AberturaCaixaFormValues } from "@/features/caixa/validators/abertura-caixa-schema";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";
import { getErrorMessage } from "@/shared/utils/get-error-message";

export function AberturaCaixaPage(): JSX.Element {
  const usuario = useAuthStore((state) => state.usuario);
  const queryClient = useQueryClient();

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

  const abrirMutation = useMutation({
    mutationFn: abrirCaixaService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: caixaQueryKeys.all });
    }
  });

  async function handleSubmit(values: AberturaCaixaFormValues): Promise<void> {
    if (!usuario) {
      throw new Error("Usuario nao autenticado");
    }

    await abrirMutation.mutateAsync({
      usuario_id: usuario.id,
      valor_inicial: values.valor_inicial,
      observacoes: values.observacoes
    });
  }

  return (
    <section className="space-y-4">
      <PageTitle title="Abrir Caixa" description="Inicie uma nova sessao de caixa para o usuario atual." />

      <Card>
        <CardContent className="p-6 text-sm">
          <p><strong>Usuario atual:</strong> {usuario?.nome} ({usuario?.login})</p>
        </CardContent>
      </Card>

      {sessaoAtualQuery.isLoading ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Consultando sessao atual...</CardContent></Card>
      ) : null}

      {sessaoAtualQuery.isError ? (
        <Card><CardContent className="p-6 text-sm text-destructive">Falha ao consultar sessao atual.</CardContent></Card>
      ) : null}

      {sessaoAtualQuery.data ? (
        <>
          <CaixaSessaoResumo sessao={sessaoAtualQuery.data} />
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Ja existe uma sessao de caixa aberta para este usuario. Feche o caixa antes de abrir outro.
            </CardContent>
          </Card>
          {movimentosQuery.data && movimentosQuery.data.length > 0 ? (
            <CaixaMovimentosTable movimentos={movimentosQuery.data} />
          ) : null}
        </>
      ) : null}

      {!sessaoAtualQuery.data ? (
        <Card>
          <CardContent className="p-6">
            <AberturaCaixaForm
              isLoading={abrirMutation.isPending}
              errorMessage={abrirMutation.isError ? getErrorMessage(abrirMutation.error, "Falha ao abrir caixa.") : undefined}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

