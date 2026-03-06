import { cn } from "@/shared/lib/cn";

type CaixaStatusBadgeProps = {
  status: "ABERTO" | "FECHADO";
};

export function CaixaStatusBadge({ status }: CaixaStatusBadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        status === "ABERTO" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
      )}
    >
      {status}
    </span>
  );
}
