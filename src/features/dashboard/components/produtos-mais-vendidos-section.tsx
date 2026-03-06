import { DashboardProdutoMaisVendidoEntity } from "@/domain/entities/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type ProdutosMaisVendidosSectionProps = {
  produtos: DashboardProdutoMaisVendidoEntity[];
};

export function ProdutosMaisVendidosSection({ produtos }: ProdutosMaisVendidosSectionProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos mais vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        {produtos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados de vendas finalizadas para agregacao.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Qtd vendida</th>
                  <th className="px-4 py-3">Total vendido</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.produto_nome} className="border-t">
                    <td className="px-4 py-3 font-medium">{produto.produto_nome}</td>
                    <td className="px-4 py-3">{produto.quantidade_vendida}</td>
                    <td className="px-4 py-3">{formatCurrency(produto.total_vendido)}</td>
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
