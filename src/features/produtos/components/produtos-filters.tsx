import { CategoriaEntity } from "@/domain/entities/produto";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { ProdutoListState, ProdutoStatusFilter } from "@/features/produtos/types/produto-filters";

type ProdutosFiltersProps = {
  value: ProdutoListState;
  categorias: CategoriaEntity[];
  onChange: (next: ProdutoListState) => void;
  onClear: () => void;
};

const statusOptions: Array<{ label: string; value: ProdutoStatusFilter }> = [
  { label: "Todos", value: "TODOS" },
  { label: "Ativos", value: "ATIVO" },
  { label: "Inativos", value: "INATIVO" }
];

export function ProdutosFilters({ value, categorias, onChange, onClear }: ProdutosFiltersProps): JSX.Element {
  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-4">
      <Input
        placeholder="Buscar por nome, codigo ou codigo de barras"
        value={value.query}
        onChange={(event) => onChange({ ...value, query: event.target.value })}
      />

      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value.categoriaId ?? ""}
        onChange={(event) =>
          onChange({
            ...value,
            categoriaId: event.target.value ? Number(event.target.value) : null
          })
        }
      >
        <option value="">Todas categorias</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nome}
          </option>
        ))}
      </select>

      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value as ProdutoStatusFilter })}
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
