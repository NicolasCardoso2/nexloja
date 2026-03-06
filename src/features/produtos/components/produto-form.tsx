import { LoaderCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoriaEntity } from "@/domain/entities/produto";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { ProdutoFormValues, produtoSchema } from "@/features/produtos/validators/produto-schema";

type ProdutoFormProps = {
  defaultValues: ProdutoFormValues;
  categorias: CategoriaEntity[];
  isLoading: boolean;
  submitLabel: string;
  errorMessage?: string;
  onSubmit: (values: ProdutoFormValues) => Promise<void>;
};

export function ProdutoForm({
  defaultValues,
  categorias,
  isLoading,
  submitLabel,
  errorMessage,
  onSubmit
}: ProdutoFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues
  });

  const submitHandler: SubmitHandler<ProdutoFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submitHandler)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="codigo">Codigo*</Label>
          <Input id="codigo" {...register("codigo")} />
          {errors.codigo ? <p className="text-xs text-destructive">{errors.codigo.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nome">Nome*</Label>
          <Input id="nome" {...register("nome")} />
          {errors.nome ? <p className="text-xs text-destructive">{errors.nome.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoria_id">Categoria*</Label>
          <select
            id="categoria_id"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            {...register("categoria_id", { valueAsNumber: true })}
          >
            <option value="">Selecione</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
          {errors.categoria_id ? <p className="text-xs text-destructive">{errors.categoria_id.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="codigo_barras">Codigo de barras</Label>
          <Input id="codigo_barras" {...register("codigo_barras")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="preco_venda">Preco de venda*</Label>
          <Input id="preco_venda" type="number" step="0.01" min="0" {...register("preco_venda", { valueAsNumber: true })} />
          {errors.preco_venda ? <p className="text-xs text-destructive">{errors.preco_venda.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="preco_custo">Preco de custo</Label>
          <Input id="preco_custo" type="number" step="0.01" min="0" {...register("preco_custo", { valueAsNumber: true })} />
          {errors.preco_custo ? <p className="text-xs text-destructive">{errors.preco_custo.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="estoque_atual">Estoque atual*</Label>
          <Input id="estoque_atual" type="number" step="0.01" min="0" {...register("estoque_atual", { valueAsNumber: true })} />
          {errors.estoque_atual ? <p className="text-xs text-destructive">{errors.estoque_atual.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="estoque_minimo">Estoque minimo*</Label>
          <Input id="estoque_minimo" type="number" step="0.01" min="0" {...register("estoque_minimo", { valueAsNumber: true })} />
          {errors.estoque_minimo ? <p className="text-xs text-destructive">{errors.estoque_minimo.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="marca">Marca</Label>
          <Input id="marca" {...register("marca")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unidade">Unidade</Label>
          <Input id="unidade" {...register("unidade")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imagem_path">Imagem path</Label>
          <Input id="imagem_path" {...register("imagem_path")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descricao</Label>
        <textarea
          id="descricao"
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register("descricao")}
        />
      </div>

      <div className="flex items-center gap-2">
        <input id="ativo" type="checkbox" className="h-4 w-4" {...register("ativo")} />
        <Label htmlFor="ativo">Produto ativo</Label>
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
