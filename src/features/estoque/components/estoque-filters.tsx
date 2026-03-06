import { CategoriaEntity } from "@/domain/entities/produto";
import { ProdutoMovimentacaoOptionEntity } from "@/domain/entities/movimentacao-estoque";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { EstoqueListState } from "@/features/estoque/types/estoque-filters";

type EstoqueFiltersProps = {
  value: EstoqueListState;
  categorias: CategoriaEntity[];
  produtos: ProdutoMovimentacaoOptionEntity[];
  onChange: (next: EstoqueListState) => void;
  onClear: () => void;
};

export function EstoqueFilters({ value, categorias, produtos, onChange, onClear }: EstoqueFiltersProps): JSX.Element {
  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-5">
      <Input
        placeholder="Buscar por nome ou codigo"
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
        value={value.produtoHistoricoId ?? ""}
        onChange={(event) =>
          onChange({
            ...value,
            produtoHistoricoId: event.target.value ? Number(event.target.value) : null
          })
        }
      >
        <option value="">Historico: todos produtos</option>
        {produtos.map((produto) => (
          <option key={produto.id} value={produto.id}>
            {produto.codigo} - {produto.nome}
          </option>
        ))}
      </select>

      <label className="flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm">
        <input
          type="checkbox"
          checked={value.apenasEstoqueBaixo}
          onChange={(event) => onChange({ ...value, apenasEstoqueBaixo: event.target.checked })}
        />
        Apenas estoque baixo
      </label>

      <Button variant="outline" onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  );
}
