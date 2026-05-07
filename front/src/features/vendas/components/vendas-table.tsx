import { Eye, Ban } from "lucide-react";
import { VendaListItemEntity } from "@/domain/entities/venda";
import { Button } from "@/shared/components/button";
import { VendaStatusBadge } from "@/features/vendas/components/venda-status-badge";

type VendasTableProps = {
  vendas: VendaListItemEntity[];
  onVisualizar: (id: number) => void;
  onCancelar: (id: number) => void;
  isCancelando: boolean;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function VendasTable({ vendas, onVisualizar, onCancelar, isCancelando }: VendasTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Numero</th>
            <th className="px-4 py-3">Data/hora</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Pagamento</th>
            <th className="px-4 py-3">Usuario</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {vendas.map((venda) => (
            <tr key={venda.id} className="border-t">
              <td className="px-4 py-3 font-medium">{venda.numero_venda}</td>
              <td className="px-4 py-3">{venda.criado_em}</td>
              <td className="px-4 py-3">{venda.cliente_nome || "-"}</td>
              <td className="px-4 py-3">{formatCurrency(venda.total)}</td>
              <td className="px-4 py-3">{venda.forma_pagamento}</td>
              <td className="px-4 py-3">{venda.usuario_nome}</td>
              <td className="px-4 py-3"><VendaStatusBadge status={venda.status} /></td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onVisualizar(venda.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isCancelando || venda.status === "CANCELADA"}
                    onClick={() => onCancelar(venda.id)}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
