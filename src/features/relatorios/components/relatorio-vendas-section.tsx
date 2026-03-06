import { ClienteListItemEntity } from "@/domain/entities/cliente";
import { RelatorioVendasResponse } from "@/domain/entities/relatorio";
import { VendaStatusBadge } from "@/features/vendas/components/venda-status-badge";

type VendasSectionProps = {
  data: RelatorioVendasResponse;
  clientes: ClienteListItemEntity[];
  filtros: {
    dataInicio: string;
    dataFim: string;
    clienteId: number | null;
    status: "" | "FINALIZADA" | "CANCELADA";
    formaPagamento: "" | "DINHEIRO" | "PIX" | "CARTAO_DEBITO" | "CARTAO_CREDITO";
  };
  onFiltrosChange: (next: VendasSectionProps["filtros"]) => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function RelatorioVendasSection({ data, clientes, filtros, onFiltrosChange }: VendasSectionProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-5">
        <input type="date" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.dataInicio} onChange={(e) => onFiltrosChange({ ...filtros, dataInicio: e.target.value })} />
        <input type="date" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.dataFim} onChange={(e) => onFiltrosChange({ ...filtros, dataFim: e.target.value })} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.clienteId ?? ""} onChange={(e) => onFiltrosChange({ ...filtros, clienteId: e.target.value ? Number(e.target.value) : null })}>
          <option value="">Todos clientes</option>
          {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.status} onChange={(e) => onFiltrosChange({ ...filtros, status: e.target.value as VendasSectionProps["filtros"]["status"] })}>
          <option value="">Todos status</option>
          <option value="FINALIZADA">FINALIZADA</option>
          <option value="CANCELADA">CANCELADA</option>
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.formaPagamento} onChange={(e) => onFiltrosChange({ ...filtros, formaPagamento: e.target.value as VendasSectionProps["filtros"]["formaPagamento"] })}>
          <option value="">Todas formas</option>
          <option value="DINHEIRO">DINHEIRO</option>
          <option value="PIX">PIX</option>
          <option value="CARTAO_DEBITO">CARTAO_DEBITO</option>
          <option value="CARTAO_CREDITO">CARTAO_CREDITO</option>
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 text-sm"><strong>Quantidade:</strong> {data.resumo.quantidade_vendas}</div>
        <div className="rounded-lg border bg-card p-4 text-sm"><strong>Total finalizadas:</strong> {formatCurrency(data.resumo.total_vendido_finalizadas)}</div>
        <div className="rounded-lg border bg-card p-4 text-sm"><strong>Descontos finalizadas:</strong> {formatCurrency(data.resumo.total_descontos_finalizadas)}</div>
        <div className="rounded-lg border bg-card p-4 text-sm"><strong>Ticket medio finalizadas:</strong> {formatCurrency(data.resumo.ticket_medio_finalizadas)}</div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Numero</th><th className="px-4 py-3">Data/hora</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Pagamento</th><th className="px-4 py-3">Subtotal</th><th className="px-4 py-3">Desconto</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.itens.length === 0 ? (<tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={9}>Nenhum resultado para os filtros aplicados.</td></tr>) : data.itens.map((item) => (
              <tr key={`${item.numero_venda}-${item.criado_em}`} className="border-t">
                <td className="px-4 py-3 font-medium">{item.numero_venda}</td>
                <td className="px-4 py-3">{item.criado_em}</td>
                <td className="px-4 py-3">{item.cliente_nome || "-"}</td>
                <td className="px-4 py-3">{item.usuario_nome}</td>
                <td className="px-4 py-3">{item.forma_pagamento}</td>
                <td className="px-4 py-3">{formatCurrency(item.subtotal)}</td>
                <td className="px-4 py-3">{formatCurrency(item.desconto)}</td>
                <td className="px-4 py-3">{formatCurrency(item.total)}</td>
                <td className="px-4 py-3"><VendaStatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

