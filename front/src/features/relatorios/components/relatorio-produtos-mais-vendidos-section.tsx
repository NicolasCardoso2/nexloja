import { CategoriaEntity } from "@/domain/entities/produto";
import { RelatorioProdutoMaisVendido } from "@/domain/entities/relatorio";

type ProdutosMaisVendidosSectionProps = {
  itens: RelatorioProdutoMaisVendido[];
  categorias: CategoriaEntity[];
  filtros: { dataInicio: string; dataFim: string; categoriaId: number | null };
  onFiltrosChange: (next: ProdutosMaisVendidosSectionProps["filtros"]) => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function RelatorioProdutosMaisVendidosSection({ itens, categorias, filtros, onFiltrosChange }: ProdutosMaisVendidosSectionProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-3">
        <input type="date" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.dataInicio} onChange={(e) => onFiltrosChange({ ...filtros, dataInicio: e.target.value })} />
        <input type="date" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.dataFim} onChange={(e) => onFiltrosChange({ ...filtros, dataFim: e.target.value })} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.categoriaId ?? ""} onChange={(e) => onFiltrosChange({ ...filtros, categoriaId: e.target.value ? Number(e.target.value) : null })}>
          <option value="">Todas categorias</option>
          {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Produto</th><th className="px-4 py-3">Codigo</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Qtd vendida</th><th className="px-4 py-3">Total vendido</th><th className="px-4 py-3">Preco medio</th></tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (<tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>Nenhum resultado para os filtros aplicados.</td></tr>) : itens.map((item) => (
              <tr key={`${item.produto_codigo}-${item.produto_nome}`} className="border-t">
                <td className="px-4 py-3 font-medium">{item.produto_nome}</td>
                <td className="px-4 py-3">{item.produto_codigo}</td>
                <td className="px-4 py-3">{item.categoria_nome}</td>
                <td className="px-4 py-3">{item.quantidade_vendida}</td>
                <td className="px-4 py-3">{formatCurrency(item.total_vendido)}</td>
                <td className="px-4 py-3">{formatCurrency(item.preco_medio_praticado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

