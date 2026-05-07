import { CurvaAbcResponse } from "@/domain/entities/relatorio";
import { cn } from "@/shared/lib/cn";

type Props = {
  data: CurvaAbcResponse;
  filtros: { dataInicio: string; dataFim: string };
  onFiltrosChange: (next: Props["filtros"]) => void;
};

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

const classeCor: Record<"A" | "B" | "C", string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  B: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  C: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function RelatorioCurvaAbcSection({ data, filtros, onFiltrosChange }: Props): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Data inicio</label>
          <input type="date" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.dataInicio} onChange={(e) => onFiltrosChange({ ...filtros, dataInicio: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Data fim</label>
          <input type="date" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filtros.dataFim} onChange={(e) => onFiltrosChange({ ...filtros, dataFim: e.target.value })} />
        </div>
      </div>

      {/* Legenda */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { classe: "A" as const, label: "Classe A — top 80% da receita", count: data.resumo.classe_a, desc: "Produtos que sustentam o caixa. Nunca deixar zerado." },
          { classe: "B" as const, label: "Classe B — proximo 15%", count: data.resumo.classe_b, desc: "Produtos secundarios. Monitorar giro regularmente." },
          { classe: "C" as const, label: "Classe C — ultimo 5%", count: data.resumo.classe_c, desc: "Pouca contribuicao. Avaliar descontinuar ou reduzir estoque." },
        ].map((item) => (
          <div key={item.classe} className={cn("rounded-lg border p-4", classeCor[item.classe].replace("bg-", "border-").replace("text-", "").replace("dark:bg-", "").replace("dark:text-", ""))}>
            <div className="flex items-center gap-2">
              <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", classeCor[item.classe])}>{item.classe}</span>
              <span className="text-sm font-medium">{item.count} produtos</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Classe</th>
                <th className="px-3 py-2">Produto</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Qtd vendida</th>
                <th className="px-3 py-2">Faturado</th>
                <th className="px-3 py-2">% produto</th>
                <th className="px-3 py-2">% acumulado</th>
              </tr>
            </thead>
            <tbody>
              {data.itens.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Nenhum dado para o periodo selecionado.</td></tr>
              ) : data.itens.map((item, i) => (
                <tr key={item.produto_codigo + i} className="border-t">
                  <td className="px-3 py-2">
                    <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", classeCor[item.classe])}>{item.classe}</span>
                  </td>
                  <td className="px-3 py-2 font-medium">{item.produto_nome}</td>
                  <td className="px-3 py-2">{item.categoria_nome}</td>
                  <td className="px-3 py-2">{item.quantidade_vendida}</td>
                  <td className="px-3 py-2">{fmt(item.total_faturado)}</td>
                  <td className="px-3 py-2">{item.pct_produto}%</td>
                  <td className="px-3 py-2">{item.pct_acumulado}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
