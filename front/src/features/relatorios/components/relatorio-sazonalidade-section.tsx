import { SazonalidadeResponse } from "@/domain/entities/relatorio";
import { cn } from "@/shared/lib/cn";

type Props = {
  data: SazonalidadeResponse;
};

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function fmtData(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function RelatorioSazonalidadeSection({ data }: Props): JSX.Element {
  const max = Math.max(...data.semanas.map((s) => s.total_vendido), 1);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium">Media semanal (ultimas 13 semanas)</p>
        <p className="text-2xl font-bold">{fmt(data.media_semanal)}</p>
        <p className="mt-1 text-xs text-muted-foreground">Semanas com barra verde estao acima da media — sinal de sazonalidade alta.</p>
      </div>

      {/* Grafico de barras horizontal simples */}
      <div className="rounded-lg border bg-card p-4">
        <p className="mb-4 text-sm font-medium">Faturamento semanal — ultimos 90 dias</p>
        <div className="space-y-2">
          {data.semanas.map((s) => {
            const pct = Math.round((s.total_vendido / max) * 100);
            return (
              <div key={s.semana} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">{fmtData(s.inicio_semana)}</span>
                <div className="relative flex-1 rounded bg-muted/40 h-6">
                  <div
                    className={cn("absolute inset-y-0 left-0 rounded transition-all", s.acima_media ? "bg-green-500" : "bg-primary/60")}
                    style={{ width: `${pct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">
                    {fmt(s.total_vendido)} ({s.quantidade_vendas} vendas)
                  </span>
                </div>
              </div>
            );
          })}
          {data.semanas.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum dado dos ultimos 90 dias.</p>
          )}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-green-500" /> Acima da media</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-primary/60" /> Abaixo da media</span>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Semana</th>
                <th className="px-3 py-2">Inicio</th>
                <th className="px-3 py-2">Vendas</th>
                <th className="px-3 py-2">Faturamento</th>
                <th className="px-3 py-2">Ticket medio</th>
                <th className="px-3 py-2">Vs media</th>
              </tr>
            </thead>
            <tbody>
              {data.semanas.map((s) => (
                <tr key={s.semana} className="border-t">
                  <td className="px-3 py-2 font-medium">{s.semana}</td>
                  <td className="px-3 py-2">{fmtData(s.inicio_semana)}</td>
                  <td className="px-3 py-2">{s.quantidade_vendas}</td>
                  <td className="px-3 py-2">{fmt(s.total_vendido)}</td>
                  <td className="px-3 py-2">{fmt(s.ticket_medio)}</td>
                  <td className={cn("px-3 py-2 font-semibold", s.acima_media ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                    {s.acima_media ? "▲ alta" : "▼ baixa"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
