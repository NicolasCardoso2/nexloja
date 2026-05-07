import { CategoriaEntity } from "@/domain/entities/produto";
import { RelatorioEstoqueBaixoItem } from "@/domain/entities/relatorio";
import { EstoqueStatusBadge } from "@/features/estoque/components/estoque-status-badge";

type EstoqueBaixoSectionProps = {
  itens: RelatorioEstoqueBaixoItem[];
  categorias: CategoriaEntity[];
  filtros: { query: string; categoriaId: number | null };
  onFiltrosChange: (next: EstoqueBaixoSectionProps["filtros"]) => void;
};

export function RelatorioEstoqueBaixoSection({ itens, categorias, filtros, onFiltrosChange }: EstoqueBaixoSectionProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-2">
        <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Buscar por produto" value={filtros.query} onChange={(e) => onFiltrosChange({ ...filtros, query: e.target.value })} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.categoriaId ?? ""} onChange={(e) => onFiltrosChange({ ...filtros, categoriaId: e.target.value ? Number(e.target.value) : null })}>
          <option value="">Todas categorias</option>
          {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Codigo</th><th className="px-4 py-3">Produto</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Estoque atual</th><th className="px-4 py-3">Estoque minimo</th><th className="px-4 py-3">Diferenca reposicao</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (<tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>Nenhum resultado para os filtros aplicados.</td></tr>) : itens.map((item) => (
              <tr key={`${item.codigo}-${item.produto_nome}`} className="border-t">
                <td className="px-4 py-3 font-medium">{item.codigo}</td>
                <td className="px-4 py-3">{item.produto_nome}</td>
                <td className="px-4 py-3">{item.categoria_nome}</td>
                <td className="px-4 py-3">{item.estoque_atual}</td>
                <td className="px-4 py-3">{item.estoque_minimo}</td>
                <td className="px-4 py-3">{item.diferenca_reposicao}</td>
                <td className="px-4 py-3"><EstoqueStatusBadge status={item.status_estoque} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

