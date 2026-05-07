import { ClienteListItemEntity } from "@/domain/entities/cliente";
import { Button } from "@/shared/components/button";
import { VendasListState } from "@/features/vendas/types/vendas-filters";

type VendasFiltersProps = {
  value: VendasListState;
  clientes: ClienteListItemEntity[];
  onChange: (next: VendasListState) => void;
  onClear: () => void;
};

export function VendasFilters({ value, clientes, onChange, onClear }: VendasFiltersProps): JSX.Element {
  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-5">
      <input
        type="date"
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value.dataInicio}
        onChange={(event) => onChange({ ...value, dataInicio: event.target.value })}
      />
      <input
        type="date"
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value.dataFim}
        onChange={(event) => onChange({ ...value, dataFim: event.target.value })}
      />
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value.clienteId ?? ""}
        onChange={(event) => onChange({ ...value, clienteId: event.target.value ? Number(event.target.value) : null })}
      >
        <option value="">Todos clientes</option>
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
        ))}
      </select>
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value as VendasListState["status"] })}
      >
        <option value="TODOS">Todos status</option>
        <option value="FINALIZADA">FINALIZADA</option>
        <option value="CANCELADA">CANCELADA</option>
      </select>
      <Button variant="outline" onClick={onClear}>Limpar filtros</Button>
    </div>
  );
}
