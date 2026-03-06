import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { ClienteStatusBadge } from "@/features/clientes/components/cliente-status-badge";
import { clienteQueryKeys } from "@/features/clientes/services/cliente-query-keys";
import { deactivateClienteService, getClienteByIdService } from "@/features/clientes/services/cliente-service";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function detailPath(routeTemplate: string, id: number): string {
  return routeTemplate.replace(":id", String(id));
}

export function ClienteDetalhePage(): JSX.Element {
  const { id } = useParams();
  const clientId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const clienteQuery = useQuery({
    queryKey: clienteQueryKeys.detail(clientId),
    queryFn: () => getClienteByIdService(clientId),
    enabled: Number.isFinite(clientId)
  });

  const inativarMutation = useMutation({
    mutationFn: deactivateClienteService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clienteQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: clienteQueryKeys.detail(clientId) });
    }
  });

  function handleInativar(): void {
    const confirmed = window.confirm("Confirma a inativacao deste cliente?");
    if (!confirmed) {
      return;
    }

    inativarMutation.mutate(clientId);
  }

  if (clienteQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Carregando cliente...</CardContent>
      </Card>
    );
  }

  if (clienteQuery.isError || !clienteQuery.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">Cliente nao encontrado.</CardContent>
      </Card>
    );
  }

  const cliente = clienteQuery.data;

  return (
    <section className="space-y-4">
      <PageTitle
        title={cliente.nome}
        description="Dados completos e historico resumido de compras"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(appRoutes.clientes)}>
              Voltar
            </Button>
            <Button variant="outline" onClick={() => navigate(detailPath(appRoutes.clienteEditar, cliente.id))}>
              Editar
            </Button>
            <Button variant="destructive" disabled={!cliente.ativo || inativarMutation.isPending} onClick={handleInativar}>
              Inativar
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <p><strong>Status:</strong> <ClienteStatusBadge ativo={cliente.ativo} /></p>
          <p><strong>CPF:</strong> {cliente.cpf || "-"}</p>
          <p><strong>Telefone:</strong> {cliente.telefone || "-"}</p>
          <p><strong>Email:</strong> {cliente.email || "-"}</p>
          <p className="md:col-span-2"><strong>Endereco:</strong> {cliente.endereco || "-"}</p>
          <p className="md:col-span-2"><strong>Observacoes:</strong> {cliente.observacoes || "-"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de compras</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <p><strong>Vendas finalizadas:</strong> {cliente.resumo_compras.quantidade_vendas}</p>
          <p><strong>Total gasto:</strong> {formatCurrency(cliente.resumo_compras.total_gasto)}</p>
          <p><strong>Ultima compra:</strong> {cliente.resumo_compras.ultima_compra_em || "-"}</p>
        </CardContent>
      </Card>
    </section>
  );
}
