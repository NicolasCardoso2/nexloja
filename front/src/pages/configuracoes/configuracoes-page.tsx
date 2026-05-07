import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfiguracoesForm } from "@/features/configuracoes/components/configuracoes-form";
import { configuracoesQueryKeys } from "@/features/configuracoes/services/configuracoes-query-keys";
import {
  getConfiguracaoLojaService,
  updateConfiguracaoLojaService
} from "@/features/configuracoes/services/configuracao-loja-service";
import {
  alterarMinhaSenha,
  atualizarMinhaConta,
  obterMinhaConta
} from "@/services/api";
import { ConfiguracoesFormValues } from "@/features/configuracoes/validators/configuracoes-schema";
import { useAuthStore } from "@/app/store/auth-store";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { PageTitle } from "@/shared/components/page-title";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { applyTheme, persistTheme } from "@/shared/utils/theme";

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
  const entrar = useAuthStore((state) => state.entrar);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | undefined>();
  const [contaFeedback, setContaFeedback] = useState<{ type: "success" | "error"; message: string } | undefined>();
  const [senhaFeedback, setSenhaFeedback] = useState<{ type: "success" | "error"; message: string } | undefined>();

  const [contaValues, setContaValues] = useState({ nome: "", email: "" });
  const [senhaValues, setSenhaValues] = useState({ senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" });

  const configuracaoQuery = useQuery({
    queryKey: configuracoesQueryKeys.loja,
    queryFn: getConfiguracaoLojaService
  });

  const minhaContaQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: obterMinhaConta
  });

  useEffect(() => {
    if (configuracaoQuery.data) {
      applyTheme(configuracaoQuery.data.tema);
      persistTheme(configuracaoQuery.data.tema);
    }
  }, [configuracaoQuery.data]);

  useEffect(() => {
    if (minhaContaQuery.data?.usuario) {
      setContaValues({
        nome: minhaContaQuery.data.usuario.nome,
        email: minhaContaQuery.data.usuario.email ?? ""
      });
    }
  }, [minhaContaQuery.data]);

  const updateMutation = useMutation({
    mutationFn: updateConfiguracaoLojaService,
    onSuccess: async (updated) => {
      applyTheme(updated.tema);
      persistTheme(updated.tema);
      setFeedback({ type: "success", message: "Configurações salvas com sucesso." });
      await queryClient.invalidateQueries({ queryKey: configuracoesQueryKeys.all });
    },
    onError: (error) => {
      setFeedback({ type: "error", message: getErrorMessage(error, "Falha ao salvar configurações da loja.") });
    }
  });

  const updateContaMutation = useMutation({
    mutationFn: atualizarMinhaConta,
    onSuccess: async (result) => {
      entrar(result.usuario, result.token);
      setContaFeedback({ type: "success", message: "Conta atualizada com sucesso." });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error) => {
      setContaFeedback({ type: "error", message: getErrorMessage(error, "Falha ao atualizar conta.") });
    }
  });

  const updateSenhaMutation = useMutation({
    mutationFn: alterarMinhaSenha,
    onSuccess: () => {
      setSenhaFeedback({ type: "success", message: "Senha alterada com sucesso." });
      setSenhaValues({ senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" });
    },
    onError: (error) => {
      setSenhaFeedback({ type: "error", message: getErrorMessage(error, "Falha ao alterar senha.") });
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

  async function handleContaSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setContaFeedback(undefined);

    const nome = contaValues.nome.trim();
    const email = contaValues.email.trim();
    const emailValido = /^\S+@\S+\.\S+$/.test(email);

    if (!nome || !emailValido) {
      setContaFeedback({ type: "error", message: "Informe nome e e-mail válido para atualizar a conta." });
      return;
    }

    await updateContaMutation.mutateAsync({ nome, email });
  }

  async function handleSenhaSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSenhaFeedback(undefined);

    if (senhaValues.novaSenha.length < 6) {
      setSenhaFeedback({ type: "error", message: "A nova senha deve ter no mínimo 6 caracteres." });
      return;
    }

    if (senhaValues.novaSenha !== senhaValues.confirmarNovaSenha) {
      setSenhaFeedback({ type: "error", message: "A confirmação da nova senha não confere." });
      return;
    }

    await updateSenhaMutation.mutateAsync({
      senha_atual: senhaValues.senhaAtual,
      nova_senha: senhaValues.novaSenha
    });
  }

  if (configuracaoQuery.isLoading) {
    return <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando configurações...</CardContent></Card>;
  }

  if (configuracaoQuery.isError) {
    return <Card><CardContent className="p-6 text-sm text-destructive">Erro ao carregar configurações da loja.</CardContent></Card>;
  }

  return (
    <section className="space-y-6">
      <PageTitle title="Configurações" description="Dados da loja, aparência e preferências do sistema." />

      <Card className="border-primary/20 bg-gradient-to-r from-card via-card to-primary/5">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Personalize o comportamento do sistema, mantenha os dados da loja atualizados e gerencie sua conta com segurança.
        </CardContent>
      </Card>

      <ConfiguracoesForm
        defaultValues={defaultValues}
        isLoading={updateMutation.isPending}
        feedback={feedback}
        onSubmit={handleSubmit}
      />

      <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-primary/20">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Minha conta</h2>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleContaSubmit}>
            <div className="space-y-2">
              <Label htmlFor="conta_nome">Nome</Label>
              <Input
                id="conta_nome"
                value={contaValues.nome}
                onChange={(event) => setContaValues((state) => ({ ...state, nome: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta_email">E-mail</Label>
              <Input
                id="conta_email"
                type="email"
                value={contaValues.email}
                onChange={(event) => setContaValues((state) => ({ ...state, email: event.target.value }))}
              />
            </div>

            {contaFeedback ? (
              <p className={contaFeedback.type === "success" ? "text-sm text-emerald-600 md:col-span-2" : "text-sm text-destructive md:col-span-2"}>
                {contaFeedback.message}
              </p>
            ) : null}

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={updateContaMutation.isPending || minhaContaQuery.isLoading}>
                Salvar conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Senha</h2>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSenhaSubmit}>
            <div className="space-y-2">
              <Label htmlFor="senha_atual">Senha atual</Label>
              <Input
                id="senha_atual"
                type="password"
                value={senhaValues.senhaAtual}
                onChange={(event) => setSenhaValues((state) => ({ ...state, senhaAtual: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nova_senha">Nova senha</Label>
              <Input
                id="nova_senha"
                type="password"
                value={senhaValues.novaSenha}
                onChange={(event) => setSenhaValues((state) => ({ ...state, novaSenha: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmar_nova_senha">Confirmar nova senha</Label>
              <Input
                id="confirmar_nova_senha"
                type="password"
                value={senhaValues.confirmarNovaSenha}
                onChange={(event) => setSenhaValues((state) => ({ ...state, confirmarNovaSenha: event.target.value }))}
              />
            </div>

            {senhaFeedback ? (
              <p className={senhaFeedback.type === "success" ? "text-sm text-emerald-600 md:col-span-3" : "text-sm text-destructive md:col-span-3"}>
                {senhaFeedback.message}
              </p>
            ) : null}

            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={updateSenhaMutation.isPending}>
                Alterar senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </section>
  );
}
