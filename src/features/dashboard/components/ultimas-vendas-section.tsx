import { DashboardUltimaVendaEntity } from "@/domain/entities/dashboard";
import { VendaStatusBadge } from "@/features/vendas/components/venda-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type UltimasVendasSectionProps = {
  vendas: DashboardUltimaVendaEntity[];
};

export function UltimasVendasSection({ vendas }: UltimasVendasSectionProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ultimas vendas</CardTitle>
      </CardHeader>
      <CardContent>
        {vendas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma venda registrada.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Numero</th>
                  <th className="px-4 py-3">Data/hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr key={`${venda.numero_venda}-${venda.criado_em}`} className="border-t">
                    <td className="px-4 py-3 font-medium">{venda.numero_venda}</td>
                    <td className="px-4 py-3">{venda.criado_em}</td>
                    <td className="px-4 py-3">{venda.cliente_nome || "-"}</td>
                    <td className="px-4 py-3">{formatCurrency(venda.total)}</td>
                    <td className="px-4 py-3">{venda.forma_pagamento}</td>
                    <td className="px-4 py-3"><VendaStatusBadge status={venda.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
