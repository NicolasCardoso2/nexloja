import { ItemVendaEntity } from "@/domain/entities/item-venda";

type VendaResumoCardProps = {
  itens: ItemVendaEntity[];
  subtotal: number;
  desconto: number;
  total: number;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function VendaResumoCard({ itens, subtotal, desconto, total }: VendaResumoCardProps): JSX.Element {
  return (
    <div className="rounded-lg border bg-card p-4 text-sm">
      <p><strong>Itens:</strong> {itens.length}</p>
      <p><strong>Subtotal:</strong> {formatCurrency(subtotal)}</p>
      <p><strong>Desconto:</strong> {formatCurrency(desconto)}</p>
      <p className="text-base"><strong>Total:</strong> {formatCurrency(total)}</p>
    </div>
  );
}
