import { Eye, Pencil, Power } from "lucide-react";
import { ProdutoListItemEntity } from "@/domain/entities/produto";
import { Button } from "@/shared/components/button";
import { ProdutoStatusBadge } from "@/features/produtos/components/produto-status-badge";

type ProdutosTableProps = {
  produtos: ProdutoListItemEntity[];
  onVisualizar: (id: number) => void;
  onEditar: (id: number) => void;
  onInativar: (id: number) => void;
  isInativando: boolean;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProdutosTable({
  produtos,
  onVisualizar,
  onEditar,
  onInativar,
  isInativando
}: ProdutosTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Codigo</th>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Preco</th>
            <th className="px-4 py-3">Estoque</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id} className="border-t">
              <td className="px-4 py-3 font-medium">{produto.codigo}</td>
              <td className="px-4 py-3">{produto.nome}</td>
              <td className="px-4 py-3">{produto.categoria_nome}</td>
              <td className="px-4 py-3">{formatCurrency(produto.preco_venda)}</td>
              <td className="px-4 py-3">{produto.estoque_atual}</td>
              <td className="px-4 py-3">
                <ProdutoStatusBadge ativo={produto.ativo} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onVisualizar(produto.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEditar(produto.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isInativando || !produto.ativo}
                    onClick={() => onInativar(produto.id)}
                  >
                    <Power className="h-4 w-4" />
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
