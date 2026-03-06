import { MovimentacaoEstoqueEntity } from "@/domain/entities/movimentacao-estoque";

type MovimentacoesEstoqueTableProps = {
  items: MovimentacaoEstoqueEntity[];
};

export function MovimentacoesEstoqueTable({ items }: MovimentacoesEstoqueTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Qtd</th>
            <th className="px-4 py-3">Antes</th>
            <th className="px-4 py-3">Depois</th>
            <th className="px-4 py-3">Motivo</th>
            <th className="px-4 py-3">Observacao</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-4 py-3">{item.criado_em}</td>
              <td className="px-4 py-3">{item.produto_codigo} - {item.produto_nome}</td>
              <td className="px-4 py-3">{item.tipo}</td>
              <td className="px-4 py-3">{item.quantidade}</td>
              <td className="px-4 py-3">{item.estoque_antes}</td>
              <td className="px-4 py-3">{item.estoque_depois}</td>
              <td className="px-4 py-3">{item.motivo}</td>
              <td className="px-4 py-3">{item.observacao || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
