import { SaudeNegocioResponse } from "@/domain/entities/relatorio";
import { cn } from "@/shared/lib/cn";

type Props = {
  data: SaudeNegocioResponse;
};

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function RelatorioSaudeSection({ data }: Props): JSX.Element {
  const pctMeta = data.dia.pct_meta;

  return (
    <div className="space-y-4">
      {/* Meta do dia */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Meta diaria</p>
            <p className="text-xs text-muted-foreground">Configure a meta em Configuracoes &rarr; Loja</p>
          </div>
          <p className="text-2xl font-bold">{data.meta_diaria > 0 ? fmt(data.meta_diaria) : "Nao definida"}</p>
        </div>
        {pctMeta !== null && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progresso hoje: {fmt(data.dia.faturado)}</span>
              <span>{pctMeta}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", pctMeta >= 100 ? "bg-green-500" : pctMeta >= 60 ? "bg-yellow-500" : "bg-red-500")}
                style={{ width: `${Math.min(pctMeta, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* KPIs em grade */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { grupo: "Hoje", items: [
            { label: "Faturamento", value: fmt(data.dia.faturado) },
            { label: "Vendas", value: String(data.dia.vendas) },
            { label: "Ticket medio", value: fmt(data.dia.ticket) },
          ]},
          { grupo: "Semana atual", items: [
            { label: "Faturamento", value: fmt(data.semana.faturado) },
            { label: "Vendas", value: String(data.semana.vendas) },
          ]},
          { grupo: "Mes atual", items: [
            { label: "Faturamento", value: fmt(data.mes.faturado) },
            { label: "Vendas", value: String(data.mes.vendas) },
            { label: "Ticket medio", value: fmt(data.mes.ticket) },
            { label: "Margem media", value: `${data.margem_media_mes_pct}%`, destaque: true },
          ]},
        ].map((grupo) => (
          <div key={grupo.grupo} className="rounded-lg border bg-card p-4">
            <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">{grupo.grupo}</p>
            <div className="space-y-2">
              {grupo.items.map((kpi) => (
                <div key={kpi.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{kpi.label}</span>
                  <span className={cn("font-semibold", (kpi as any).destaque && "text-green-600 dark:text-green-400")}>{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Margem calculada com base no preco de custo cadastrado nos produtos.</p>
    </div>
  );
}
