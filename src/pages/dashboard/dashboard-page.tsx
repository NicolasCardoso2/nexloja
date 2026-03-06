import { AlertTriangle, Boxes, DollarSign, Receipt, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store/auth-store";
import { CaixaAtualSection } from "@/features/dashboard/components/caixa-atual-section";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { ProdutosMaisVendidosSection } from "@/features/dashboard/components/produtos-mais-vendidos-section";
import { UltimasVendasSection } from "@/features/dashboard/components/ultimas-vendas-section";
import { dashboardQueryKeys } from "@/features/dashboard/services/dashboard-query-keys";
import { getDashboardResumoService } from "@/features/dashboard/services/dashboard-service";
import { Card, CardContent } from "@/shared/components/card";
import { PageTitle } from "@/shared/components/page-title";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function DashboardPage(): JSX.Element {
  const usuario = useAuthStore((state) => state.usuario);

  const dashboardQuery = useQuery({
    queryKey: dashboardQueryKeys.resumo(usuario?.id ?? 0),
    queryFn: () => getDashboardResumoService(usuario!.id),
    enabled: Boolean(usuario)
  });

  return (
    <section className="space-y-4">
      <PageTitle title="Dashboard" description="Indicadores operacionais em tempo real da loja." />

      {dashboardQuery.isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Carregando dashboard...</CardContent>
        </Card>
      ) : null}

      {dashboardQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Erro ao carregar dados do dashboard.</CardContent>
        </Card>
      ) : null}

      {dashboardQuery.data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total vendido (dia)"
              value={formatCurrency(dashboardQuery.data.total_vendido_dia)}
              helper="Apenas vendas finalizadas"
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Vendas finalizadas (dia)"
              value={String(dashboardQuery.data.quantidade_vendas_dia)}
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Ticket medio (dia)"
              value={formatCurrency(dashboardQuery.data.ticket_medio_dia)}
              icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Estoque baixo"
              value={String(dashboardQuery.data.produtos_estoque_baixo)}
              helper={`Zerados: ${dashboardQuery.data.produtos_zerados}`}
              icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CaixaAtualSection caixa={dashboardQuery.data.caixa_atual} />
            <Card>
              <CardContent className="flex h-full flex-col justify-center p-6 text-sm">
                <p className="mb-2 flex items-center gap-2 font-medium"><Boxes className="h-4 w-4" /> Alertas de estoque</p>
                <p><strong>Produtos com estoque baixo:</strong> {dashboardQuery.data.produtos_estoque_baixo}</p>
                <p><strong>Produtos zerados:</strong> {dashboardQuery.data.produtos_zerados}</p>
              </CardContent>
            </Card>
          </div>

          <UltimasVendasSection vendas={dashboardQuery.data.ultimas_vendas} />
          <ProdutosMaisVendidosSection produtos={dashboardQuery.data.produtos_mais_vendidos} />
        </>
      ) : null}
    </section>
  );
}
