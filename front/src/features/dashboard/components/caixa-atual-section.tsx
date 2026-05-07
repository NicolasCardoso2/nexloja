import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { DashboardCaixaAtualEntity } from "@/domain/entities/dashboard";
import { CaixaStatusBadge } from "@/features/caixa/components/caixa-status-badge";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type CaixaAtualSectionProps = {
  caixa: DashboardCaixaAtualEntity;
};

export function CaixaAtualSection({ caixa }: CaixaAtualSectionProps): JSX.Element {
  const navigate = useNavigate();
  const statusLabel = caixa.status === "SEM_SESSAO" ? "FECHADO" : caixa.status;
  const actionHref = caixa.status === "ABERTO" ? appRoutes.caixaFechar : appRoutes.caixaAbrir;
  const actionLabel = caixa.status === "ABERTO" ? "Fechar caixa" : "Abrir caixa";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Caixa atual</CardTitle>
        <CaixaStatusBadge status={statusLabel as "ABERTO" | "FECHADO"} />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong>Abertura:</strong> {caixa.aberto_em || "-"}</p>
        <p><strong>Valor inicial:</strong> {caixa.valor_inicial != null ? formatCurrency(caixa.valor_inicial) : "-"}</p>
        <p><strong>Valor movimentado:</strong> {formatCurrency(caixa.valor_movimentado)}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(actionHref)}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
