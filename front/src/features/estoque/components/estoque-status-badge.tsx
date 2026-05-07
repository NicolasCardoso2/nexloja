import { cn } from "@/shared/lib/cn";
import { EstoqueStatus } from "@/domain/entities/movimentacao-estoque";

type EstoqueStatusBadgeProps = {
  status: EstoqueStatus;
};

const labels: Record<EstoqueStatus, string> = {
  NORMAL: "Normal",
  BAIXO: "Baixo",
  ZERADO: "Zerado"
};

export function EstoqueStatusBadge({ status }: EstoqueStatusBadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        status === "NORMAL" && "bg-emerald-100 text-emerald-700",
        status === "BAIXO" && "bg-amber-100 text-amber-700",
        status === "ZERADO" && "bg-rose-100 text-rose-700"
      )}
    >
      {labels[status]}
    </span>
  );
}
