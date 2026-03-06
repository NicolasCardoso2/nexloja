import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfiguracoesForm } from "@/features/configuracoes/components/configuracoes-form";
import { configuracoesQueryKeys } from "@/features/configuracoes/services/configuracoes-query-keys";
import {
  getConfiguracaoLojaService,
  updateConfiguracaoLojaService
} from "@/features/configuracoes/services/configuracao-loja-service";
import { ConfiguracoesFormValues } from "@/features/configuracoes/validators/configuracoes-schema";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";
import { getErrorMessage } from "@/shared/utils/get-error-message";

function applyTheme(tema: "light" | "dark"): void {
  const root = document.documentElement;
  if (tema === "dark") {
    root.classList.add("dark");
    return;
  }

  root.classList.remove("dark");
}

const fallbackValues: ConfiguracoesFormValues = {
  nome_loja: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  logo_path: "",
  tema: "light",
  moeda: "BRL"
};

export function ConfiguracoesPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | undefined>();

  const configuracaoQuery = useQuery({
    queryKey: configuracoesQueryKeys.loja,
    queryFn: getConfiguracaoLojaService
  });

  useEffect(() => {
    if (configuracaoQuery.data) {
      applyTheme(configuracaoQuery.data.tema);
    }
  }, [configuracaoQuery.data]);

  const updateMutation = useMutation({
    mutationFn: updateConfiguracaoLojaService,
    onSuccess: async (updated) => {
      applyTheme(updated.tema);
      setFeedback({ type: "success", message: "Configuracoes salvas com sucesso." });
      await queryClient.invalidateQueries({ queryKey: configuracoesQueryKeys.all });
    },
    onError: (error) => {
      setFeedback({ type: "error", message: getErrorMessage(error, "Falha ao salvar configuracoes da loja.") });
    }
  });

  const defaultValues = useMemo<ConfiguracoesFormValues>(() => {
    if (!configuracaoQuery.data) {
      return fallbackValues;
    }

    return {
      nome_loja: configuracaoQuery.data.nome_loja,
      cnpj: configuracaoQuery.data.cnpj ?? "",
      telefone: configuracaoQuery.data.telefone ?? "",
      email: configuracaoQuery.data.email ?? "",
      endereco: configuracaoQuery.data.endereco ?? "",
      logo_path: configuracaoQuery.data.logo_path ?? "",
      tema: configuracaoQuery.data.tema,
      moeda: configuracaoQuery.data.moeda
    };
  }, [configuracaoQuery.data]);

  async function handleSubmit(values: ConfiguracoesFormValues): Promise<void> {
    setFeedback(undefined);
    await updateMutation.mutateAsync(values);
  }

  if (configuracaoQuery.isLoading) {
    return <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando configuracoes...</CardContent></Card>;
  }

  if (configuracaoQuery.isError) {
    return <Card><CardContent className="p-6 text-sm text-destructive">Erro ao carregar configuracoes da loja.</CardContent></Card>;
  }

  return (
    <section className="space-y-4">
      <PageTitle title="Configuracoes" description="Dados da loja, tema e moeda do sistema." />
      <ConfiguracoesForm
        defaultValues={defaultValues}
        isLoading={updateMutation.isPending}
        feedback={feedback}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
