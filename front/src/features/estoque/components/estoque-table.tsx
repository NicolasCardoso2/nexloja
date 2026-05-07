import { EstoqueItemEntity } from "@/domain/entities/movimentacao-estoque";
import { EstoqueStatusBadge } from "@/features/estoque/components/estoque-status-badge";
import { ProdutoAtivoBadge } from "@/features/estoque/components/produto-ativo-badge";

type EstoqueTableProps = {
  items: EstoqueItemEntity[];
};

export function EstoqueTable({ items }: EstoqueTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Codigo</th>
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Estoque atual</th>
            <th className="px-4 py-3">Estoque minimo</th>
            <th className="px-4 py-3">Status estoque</th>
            <th className="px-4 py-3">Status produto</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.produto_id} className="border-t">
              <td className="px-4 py-3 font-medium">{item.codigo}</td>
              <td className="px-4 py-3">{item.nome}</td>
              <td className="px-4 py-3">{item.categoria_nome}</td>
              <td className="px-4 py-3">{item.estoque_atual}</td>
              <td className="px-4 py-3">{item.estoque_minimo}</td>
              <td className="px-4 py-3">
                <EstoqueStatusBadge status={item.status_estoque} />
              </td>
              <td className="px-4 py-3">
                <ProdutoAtivoBadge ativo={item.ativo} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
