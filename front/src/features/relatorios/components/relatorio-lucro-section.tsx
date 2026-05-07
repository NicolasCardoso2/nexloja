import { RelatorioLucroResponse } from "@/domain/entities/relatorio";
import { CategoriaEntity } from "@/domain/entities/produto";
import { cn } from "@/shared/lib/cn";

type Props = {
  data: RelatorioLucroResponse;
  categorias: CategoriaEntity[];
  filtros: { dataInicio: string; dataFim: string; categoriaId: number | null };
  onFiltrosChange: (next: Props["filtros"]) => void;
};

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function RelatorioLucroSection({ data, categorias, filtros, onFiltrosChange }: Props): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Data inicio</label>
          <input type="date" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.dataInicio} onChange={(e) => onFiltrosChange({ ...filtros, dataInicio: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Data fim</label>
          <input type="date" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.dataFim} onChange={(e) => onFiltrosChange({ ...filtros, dataFim: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Categoria</label>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.categoriaId ?? ""} onChange={(e) => onFiltrosChange({ ...filtros, categoriaId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Todas categorias</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Faturamento", value: fmt(data.resumo.total_faturado) },
          { label: "Custo total", value: fmt(data.resumo.total_custo) },
          { label: "Lucro bruto", value: fmt(data.resumo.lucro_bruto), destaque: true },
          { label: "Margem media", value: `${data.resumo.margem_media_pct}%` },
        ].map((kpi) => (
          <div key={kpi.label} className={cn("rounded-lg border bg-card p-4", kpi.destaque && "border-green-500/40 bg-green-50/10 dark:bg-green-950/20")}>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className={cn("text-xl font-bold", kpi.destaque && "text-green-600 dark:text-green-400")}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Por categoria */}
      <div className="rounded-lg border bg-card p-4">
        <p className="mb-3 text-sm font-medium">Lucro por categoria</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-3 py-2">Categoria</th><th className="px-3 py-2">Faturado</th><th className="px-3 py-2">Custo</th><th className="px-3 py-2">Lucro</th><th className="px-3 py-2">Margem</th></tr>
            </thead>
            <tbody>
              {data.por_categoria.map((c) => (
                <tr key={c.categoria_nome} className="border-t">
                  <td className="px-3 py-2 font-medium">{c.categoria_nome}</td>
                  <td className="px-3 py-2">{fmt(c.total_faturado)}</td>
                  <td className="px-3 py-2">{fmt(c.total_custo)}</td>
                  <td className={cn("px-3 py-2 font-semibold", c.lucro >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600")}>{fmt(c.lucro)}</td>
                  <td className="px-3 py-2">{c.margem_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Por produto */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <p className="border-b px-4 py-3 text-sm font-medium">Lucro por produto</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-3 py-2">Produto</th><th className="px-3 py-2">Categoria</th><th className="px-3 py-2">Qtd vendida</th><th className="px-3 py-2">Faturado</th><th className="px-3 py-2">Custo</th><th className="px-3 py-2">Lucro</th><th className="px-3 py-2">Margem</th></tr>
            </thead>
            <tbody>
              {data.por_produto.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Nenhum dado para o periodo selecionado.</td></tr>
              ) : data.por_produto.map((p) => (
                <tr key={p.produto_codigo} className="border-t">
                  <td className="px-3 py-2 font-medium">{p.produto_nome}</td>
                  <td className="px-3 py-2">{p.categoria_nome}</td>
                  <td className="px-3 py-2">{p.quantidade_vendida}</td>
                  <td className="px-3 py-2">{fmt(p.total_faturado)}</td>
                  <td className="px-3 py-2">{fmt(p.total_custo)}</td>
                  <td className={cn("px-3 py-2 font-semibold", p.lucro >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600")}>{fmt(p.lucro)}</td>
                  <td className="px-3 py-2">{p.margem_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
