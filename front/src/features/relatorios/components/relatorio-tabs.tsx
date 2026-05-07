import { RelatorioAba, relatorioAbas } from "@/features/relatorios/types/relatorio-abas";
import { cn } from "@/shared/lib/cn";

type RelatorioTabsProps = {
  activeTab: RelatorioAba;
  onChange: (tab: RelatorioAba) => void;
};

export function RelatorioTabs({ activeTab, onChange }: RelatorioTabsProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border bg-card p-2">
      {relatorioAbas.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
