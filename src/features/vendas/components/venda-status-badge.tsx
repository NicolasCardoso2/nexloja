import { cn } from "@/shared/lib/cn";
import { VendaStatus } from "@/domain/entities/venda";

type VendaStatusBadgeProps = {
  status: VendaStatus;
};

export function VendaStatusBadge({ status }: VendaStatusBadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        status === "FINALIZADA" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      )}
    >
      {status}
    </span>
  );
}
