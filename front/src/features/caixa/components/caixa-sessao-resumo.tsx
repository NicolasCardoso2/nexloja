import { CaixaSessaoEntity } from "@/domain/entities/caixa-sessao";
import { CaixaStatusBadge } from "@/features/caixa/components/caixa-status-badge";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type CaixaSessaoResumoProps = {
  sessao: CaixaSessaoEntity;
};

export function CaixaSessaoResumo({ sessao }: CaixaSessaoResumoProps): JSX.Element {
  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-3">
      <p>
        <strong>Status:</strong> <CaixaStatusBadge status={sessao.status} />
      </p>
      <p>
        <strong>Abertura:</strong> {sessao.aberto_em}
      </p>
      <p>
        <strong>Valor inicial:</strong> {formatCurrency(sessao.valor_abertura)}
      </p>
      <p>
        <strong>Total movimentos:</strong> {sessao.total_movimentos}
      </p>
      <p>
        <strong>Valor calculado:</strong> {formatCurrency(sessao.valor_final_calculado)}
      </p>
      <p>
        <strong>Observacoes:</strong> {sessao.observacao || "-"}
      </p>
    </div>
  );
}
