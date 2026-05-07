import { ReposicaoResponse } from "@/domain/entities/relatorio";
import { cn } from "@/shared/lib/cn";

type Props = {
  data: ReposicaoResponse;
};

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function RelatorioReposicaoSection({ data }: Props): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium">Custo estimado para repor tudo listado</p>
        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{fmt(data.custo_total_sugerido)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {data.itens.length} produto(s) em alerta — baseado em vendas dos ultimos 30 dias com cobertura alvo de 30 dias.
        </p>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Produto</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Estoque atual</th>
                <th className="px-3 py-2">Estoque minimo</th>
                <th className="px-3 py-2">Vend./dia</th>
                <th className="px-3 py-2">Cobertura (dias)</th>
                <th className="px-3 py-2">Sugestao compra</th>
                <th className="px-3 py-2">Custo reposicao</th>
              </tr>
            </thead>
            <tbody>
              {data.itens.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">Nenhum produto em alerta de reposicao.</td></tr>
              ) : data.itens.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{item.produto_nome}</td>
                  <td className="px-3 py-2">{item.categoria_nome}</td>
                  <td className={cn("px-3 py-2", item.estoque_atual <= item.estoque_minimo && "font-semibold text-red-600 dark:text-red-400")}>
                    {item.estoque_atual}
                  </td>
                  <td className="px-3 py-2">{item.estoque_minimo}</td>
                  <td className="px-3 py-2">{item.velocidade_dia}</td>
                  <td className={cn("px-3 py-2", item.dias_cobertura !== null && item.dias_cobertura <= 7 && "font-semibold text-orange-600 dark:text-orange-400")}>
                    {item.dias_cobertura !== null ? item.dias_cobertura : "—"}
                  </td>
                  <td className="px-3 py-2 font-semibold">{item.quantidade_sugerida} un</td>
                  <td className="px-3 py-2">{fmt(item.custo_reposicao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
