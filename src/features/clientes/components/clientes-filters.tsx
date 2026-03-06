import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { ClienteListState, ClienteStatusFilter } from "@/features/clientes/types/cliente-filters";

type ClientesFiltersProps = {
  value: ClienteListState;
  onChange: (next: ClienteListState) => void;
  onClear: () => void;
};

const statusOptions: Array<{ label: string; value: ClienteStatusFilter }> = [
  { label: "Todos", value: "TODOS" },
  { label: "Ativos", value: "ATIVO" },
  { label: "Inativos", value: "INATIVO" }
];

export function ClientesFilters({ value, onChange, onClear }: ClientesFiltersProps): JSX.Element {
  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-3">
      <Input
        placeholder="Buscar por nome, CPF ou telefone"
        value={value.query}
        onChange={(event) => onChange({ ...value, query: event.target.value })}
      />

      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value as ClienteStatusFilter })}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <Button variant="outline" onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  );
}
