import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { ClienteForm } from "@/features/clientes/components/cliente-form";
import { clienteQueryKeys } from "@/features/clientes/services/cliente-query-keys";
import { createClienteService, getClienteByIdService, updateClienteService } from "@/features/clientes/services/cliente-service";
import { ClienteFormValues } from "@/features/clientes/validators/cliente-schema";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

const defaultValues: ClienteFormValues = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  endereco: "",
  observacoes: "",
  ativo: true
};

function toFormValues(cliente: Awaited<ReturnType<typeof getClienteByIdService>>): ClienteFormValues {
  return {
    nome: cliente.nome,
    cpf: cliente.cpf ?? "",
    telefone: cliente.telefone ?? "",
    email: cliente.email ?? "",
    endereco: cliente.endereco ?? "",
    observacoes: cliente.observacoes ?? "",
    ativo: cliente.ativo
  };
}

export function ClienteFormPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clientId = id ? Number(id) : null;
  const isEdit = Boolean(clientId);

  const clienteQuery = useQuery({
    queryKey: clientId ? clienteQueryKeys.detail(clientId) : ["clientes", "detail", "new"],
    queryFn: () => getClienteByIdService(clientId as number),
    enabled: isEdit
  });

  const createMutation = useMutation({
    mutationFn: createClienteService,
    onSuccess: async (createdId) => {
      await queryClient.invalidateQueries({ queryKey: clienteQueryKeys.all });
      navigate(appRoutes.clienteDetalhe.replace(":id", String(createdId)));
    }
  });

  const updateMutation = useMutation({
    mutationFn: (values: ClienteFormValues) => updateClienteService(clientId as number, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clienteQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: clienteQueryKeys.detail(clientId as number) });
      navigate(appRoutes.clienteDetalhe.replace(":id", String(clientId)));
    }
  });

  const currentValues = useMemo(() => {
    if (isEdit && clienteQuery.data) {
      return toFormValues(clienteQuery.data);
    }

    return defaultValues;
  }, [isEdit, clienteQuery.data]);

  async function handleSubmit(values: ClienteFormValues): Promise<void> {
    if (isEdit) {
      await updateMutation.mutateAsync(values);
      return;
    }

    await createMutation.mutateAsync(values);
  }

  if (isEdit && clienteQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Carregando formulario...</CardContent>
      </Card>
    );
  }

  if (isEdit && clienteQuery.isError) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">Falha ao carregar dados do cliente.</CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <PageTitle
        title={isEdit ? "Editar Cliente" : "Novo Cliente"}
        description="Preencha os dados do cliente para cadastro ou atualizacao."
      />

      <Card>
        <CardContent className="p-6">
          <ClienteForm
            defaultValues={currentValues}
            isLoading={createMutation.isPending || updateMutation.isPending}
            submitLabel={isEdit ? "Salvar alteracoes" : "Cadastrar cliente"}
            errorMessage={
              createMutation.isError || updateMutation.isError
                ? "Falha ao salvar cliente. Verifique os dados informados."
                : undefined
            }
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </section>
  );
}
