import { cn } from "@/shared/lib/cn";

type ProdutoAtivoBadgeProps = {
  ativo: boolean;
};

export function ProdutoAtivoBadge({ ativo }: ProdutoAtivoBadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
      )}
    >
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}
