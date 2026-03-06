import { Plus } from "lucide-react";
import { ProdutoVendaBuscaEntity } from "@/domain/entities/venda";
import { Button } from "@/shared/components/button";

type ProdutosBuscaListaProps = {
  produtos: ProdutoVendaBuscaEntity[];
  onAdicionar: (produto: ProdutoVendaBuscaEntity) => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProdutosBuscaLista({ produtos, onAdicionar }: ProdutosBuscaListaProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3">Preco</th>
            <th className="px-4 py-3">Estoque</th>
            <th className="px-4 py-3 text-right">Acao</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id} className="border-t">
              <td className="px-4 py-3">{produto.codigo} - {produto.nome}</td>
              <td className="px-4 py-3">{formatCurrency(produto.preco_venda)}</td>
              <td className="px-4 py-3">{produto.estoque_atual}</td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" disabled={produto.estoque_atual <= 0} onClick={() => onAdicionar(produto)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
