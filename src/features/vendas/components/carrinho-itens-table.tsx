import { Trash2 } from "lucide-react";
import { ItemVendaEntity } from "@/domain/entities/item-venda";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";

type CarrinhoItensTableProps = {
  itens: ItemVendaEntity[];
  onQuantidadeChange: (produtoId: number, quantidade: number) => void;
  onRemover: (produtoId: number) => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function CarrinhoItensTable({ itens, onQuantidadeChange, onRemover }: CarrinhoItensTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3">Preco unitario</th>
            <th className="px-4 py-3">Quantidade</th>
            <th className="px-4 py-3">Subtotal</th>
            <th className="px-4 py-3 text-right">Acao</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.produto_id} className="border-t">
              <td className="px-4 py-3">{item.produto_codigo} - {item.produto_nome}</td>
              <td className="px-4 py-3">{formatCurrency(item.preco_unitario)}</td>
              <td className="px-4 py-3">
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantidade}
                  onChange={(event) => onQuantidadeChange(item.produto_id, Number(event.target.value))}
                />
              </td>
              <td className="px-4 py-3">{formatCurrency(item.subtotal)}</td>
              <td className="px-4 py-3 text-right">
                <Button variant="destructive" size="sm" onClick={() => onRemover(item.produto_id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
