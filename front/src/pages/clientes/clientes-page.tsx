import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { ClientesFilters } from "@/features/clientes/components/clientes-filters";
import { ClientesTable } from "@/features/clientes/components/clientes-table";
import { clienteQueryKeys } from "@/features/clientes/services/cliente-query-keys";
import { listClientesService } from "@/features/clientes/services/cliente-service";
import { ClienteListState, serializeClienteFilters, toClienteFilters } from "@/features/clientes/types/cliente-filters";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

const defaultFilters: ClienteListState = {
  query: "",
  status: "TODOS"
};

function clientPath(routeTemplate: string, id: number): string {
  return routeTemplate.replace(":id", String(id));
}

export function ClientesPage(): JSX.Element {
  const navigate = useNavigate();
  const [filtersState, setFiltersState] = useState<ClienteListState>(defaultFilters);

  const serializedFilters = useMemo(() => serializeClienteFilters(filtersState), [filtersState]);

  const clientesQuery = useQuery({
    queryKey: clienteQueryKeys.list(serializedFilters),
    queryFn: () => listClientesService(toClienteFilters(filtersState)),
    staleTime: 5 * 60 * 1000
  });

  return (
    <section className="space-y-4">
      <PageTitle
        title="Clientes"
        description="Gerencie cadastro e status dos clientes."
        actions={<Button onClick={() => navigate(appRoutes.clienteNovo)}>Novo cliente</Button>}
      />

      <ClientesFilters value={filtersState} onChange={setFiltersState} onClear={() => setFiltersState(defaultFilters)} />

      {clientesQuery.isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Carregando clientes...</CardContent>
        </Card>
      ) : null}

      {clientesQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Erro ao carregar clientes.</CardContent>
        </Card>
      ) : null}

      {clientesQuery.data && clientesQuery.data.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Nenhum cliente encontrado para os filtros aplicados.</CardContent>
        </Card>
      ) : null}

      {clientesQuery.data && clientesQuery.data.length > 0 ? (
        <ClientesTable
          clientes={clientesQuery.data}
          isInativando={false}
          onVisualizar={(id) => navigate(clientPath(appRoutes.clienteDetalhe, id))}
          onEditar={(id) => navigate(clientPath(appRoutes.clienteEditar, id))}
          onInativar={() => {}}
        />
      ) : null}
    </section>
  );
}
