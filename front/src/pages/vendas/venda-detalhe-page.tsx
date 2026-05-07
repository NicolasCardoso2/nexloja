import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/auth-store";
import { cancelarVenda } from "@/domain/rules/cancelar-venda";
import { VendaStatusBadge } from "@/features/vendas/components/venda-status-badge";
import { vendaQueryKeys } from "@/features/vendas/services/venda-query-keys";
import { cancelarVendaService, getVendaByIdService } from "@/features/vendas/services/venda-service";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";
import { getErrorMessage } from "@/shared/utils/get-error-message";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function VendaDetalhePage(): JSX.Element {
  const { id } = useParams();
  const vendaId = Number(id);
  const usuario = useAuthStore((state) => state.usuario);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const vendaQuery = useQuery({
    queryKey: vendaQueryKeys.detail(vendaId),
    queryFn: () => getVendaByIdService(vendaId),
    enabled: Number.isFinite(vendaId)
  });

  const cancelarMutation = useMutation({
    mutationFn: cancelarVendaService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: vendaQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: vendaQueryKeys.detail(vendaId) });
    }
  });

  function handleCancelar(): void {
    if (!usuario || !vendaQuery.data) {
      return;
    }

    const check = cancelarVenda(vendaQuery.data);
    if (!check.podeCancelar) {
      window.alert(check.motivo);
      return;
    }

    const confirmed = window.confirm("Confirma o cancelamento desta venda?");
    if (!confirmed) {
      return;
    }

    const motivo = window.prompt("Motivo do cancelamento (opcional):") ?? undefined;

    cancelarMutation.mutate({
      venda_id: vendaId,
      usuario_id: usuario.id,
      motivo
    });
  }

  if (vendaQuery.isLoading) {
    return <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando venda...</CardContent></Card>;
  }

  if (vendaQuery.isError || !vendaQuery.data) {
    return <Card><CardContent className="p-6 text-sm text-destructive">Venda nao encontrada.</CardContent></Card>;
  }

  const venda = vendaQuery.data;

  return (
    <section className="space-y-4">
      <PageTitle
        title={`Venda ${venda.numero_venda}`}
        description={venda.criado_em}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(appRoutes.vendas)}>Voltar</Button>
            <Button variant="destructive" disabled={venda.status === "CANCELADA" || cancelarMutation.isPending} onClick={handleCancelar}>
              Cancelar venda
            </Button>
          </div>
        }
      />

      {cancelarMutation.isError ? (
        <Card><CardContent className="p-6 text-sm text-destructive">{getErrorMessage(cancelarMutation.error, "Falha ao cancelar venda.")}</CardContent></Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <p><strong>Status:</strong> <VendaStatusBadge status={venda.status} /></p>
          <p><strong>Forma de pagamento:</strong> {venda.forma_pagamento}</p>
          <p><strong>Cliente:</strong> {venda.cliente_nome || "-"}</p>
          <p><strong>Usuario:</strong> {venda.usuario_nome}</p>
          <p><strong>Subtotal:</strong> {formatCurrency(venda.subtotal)}</p>
          <p><strong>Desconto:</strong> {formatCurrency(venda.desconto)}</p>
          <p><strong>Total:</strong> {formatCurrency(venda.total)}</p>
          <p><strong>Cancelado em:</strong> {venda.cancelado_em || "-"}</p>
          <p className="md:col-span-2"><strong>Motivo cancelamento:</strong> {venda.motivo_cancelamento || "-"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Quantidade</th>
                  <th className="px-4 py-3">Valor unitario</th>
                  <th className="px-4 py-3">Total item</th>
                </tr>
              </thead>
              <tbody>
                {venda.itens.map((item) => (
                  <tr key={item.produto_id} className="border-t">
                    <td className="px-4 py-3">{item.produto_codigo} - {item.produto_nome}</td>
                    <td className="px-4 py-3">{item.quantidade}</td>
                    <td className="px-4 py-3">{formatCurrency(item.preco_unitario)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

