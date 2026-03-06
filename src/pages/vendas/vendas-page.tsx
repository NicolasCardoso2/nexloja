import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/auth-store";
import { cancelarVenda } from "@/domain/rules/cancelar-venda";
import { listClientesService } from "@/features/clientes/services/cliente-service";
import { VendasFilters } from "@/features/vendas/components/vendas-filters";
import { VendasTable } from "@/features/vendas/components/vendas-table";
import { vendaQueryKeys } from "@/features/vendas/services/venda-query-keys";
import { cancelarVendaService, getVendaByIdService, listVendasService } from "@/features/vendas/services/venda-service";
import { serializeVendasFilters, toVendasFilters, VendasListState } from "@/features/vendas/types/vendas-filters";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";
import { getErrorMessage } from "@/shared/utils/get-error-message";

const defaultFilters: VendasListState = {
  dataInicio: "",
  dataFim: "",
  clienteId: null,
  status: "TODOS"
};

function vendaPath(routeTemplate: string, id: number): string {
  return routeTemplate.replace(":id", String(id));
}

export function VendasPage(): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const usuario = useAuthStore((state) => state.usuario);
  const [filtersState, setFiltersState] = useState<VendasListState>(defaultFilters);
  const filters = useMemo(() => toVendasFilters(filtersState), [filtersState]);

  const clientesQuery = useQuery({
    queryKey: ["clientes", "filtro-vendas"],
    queryFn: () => listClientesService({})
  });

  const vendasQuery = useQuery({
    queryKey: vendaQueryKeys.list(serializeVendasFilters(filtersState)),
    queryFn: () => listVendasService(filters)
  });

  const cancelarMutation = useMutation({
    mutationFn: cancelarVendaService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: vendaQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ["estoque"] });
    }
  });

  async function handleCancelar(vendaId: number): Promise<void> {
    if (!usuario) {
      return;
    }

    const venda = await getVendaByIdService(vendaId);
    const check = cancelarVenda(venda);
    if (!check.podeCancelar) {
      window.alert(check.motivo);
      return;
    }

    const confirm = window.confirm("Confirma o cancelamento desta venda?");
    if (!confirm) {
      return;
    }

    const motivo = window.prompt("Motivo do cancelamento (opcional):") ?? undefined;

    cancelarMutation.mutate({
      venda_id: vendaId,
      usuario_id: usuario.id,
      motivo
    });
  }

  return (
    <section className="space-y-4">
      <PageTitle
        title="Historico de Vendas"
        description="Consulte vendas finalizadas e canceladas com filtros."
        actions={<Button onClick={() => navigate(appRoutes.vendaNova)}>Nova venda</Button>}
      />

      <VendasFilters
        value={filtersState}
        clientes={clientesQuery.data ?? []}
        onChange={setFiltersState}
        onClear={() => setFiltersState(defaultFilters)}
      />

      {vendasQuery.isLoading ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando vendas...</CardContent></Card>
      ) : null}

      {vendasQuery.isError ? (
        <Card><CardContent className="p-6 text-sm text-destructive">Erro ao carregar vendas.</CardContent></Card>
      ) : null}

      {vendasQuery.data && vendasQuery.data.length === 0 ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Nenhuma venda encontrada.</CardContent></Card>
      ) : null}

      {cancelarMutation.isError ? (
        <Card><CardContent className="p-6 text-sm text-destructive">{getErrorMessage(cancelarMutation.error, "Falha ao cancelar venda.")}</CardContent></Card>
      ) : null}

      {vendasQuery.data && vendasQuery.data.length > 0 ? (
        <VendasTable
          vendas={vendasQuery.data}
          isCancelando={cancelarMutation.isPending}
          onVisualizar={(id) => navigate(vendaPath(appRoutes.vendaDetalhe, id))}
          onCancelar={(id) => {
            void handleCancelar(id);
          }}
        />
      ) : null}
    </section>
  );
}

