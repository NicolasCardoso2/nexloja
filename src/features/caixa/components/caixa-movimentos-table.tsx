import { CaixaMovimentoEntity } from "@/domain/entities/caixa-sessao";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type CaixaMovimentosTableProps = {
  movimentos: CaixaMovimentoEntity[];
};

export function CaixaMovimentosTable({ movimentos }: CaixaMovimentosTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Valor</th>
            <th className="px-4 py-3">Observacao</th>
          </tr>
        </thead>
        <tbody>
          {movimentos.map((movimento) => (
            <tr key={movimento.id} className="border-t">
              <td className="px-4 py-3">{movimento.criado_em}</td>
              <td className="px-4 py-3">{movimento.tipo === "SUPRIMENTO" ? "REFORCO" : movimento.tipo}</td>
              <td className="px-4 py-3">{formatCurrency(movimento.valor)}</td>
              <td className="px-4 py-3">{movimento.observacao || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
