import { LoaderCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProdutoMovimentacaoOptionEntity } from "@/domain/entities/movimentacao-estoque";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import {
  MovimentacaoEstoqueFormValues,
  movimentacaoEstoqueSchema
} from "@/features/estoque/validators/movimentacao-estoque-schema";

type MovimentacaoEstoqueFormProps = {
  produtos: ProdutoMovimentacaoOptionEntity[];
  isLoading: boolean;
  errorMessage?: string;
  onSubmit: (values: MovimentacaoEstoqueFormValues) => Promise<void>;
};

export function MovimentacaoEstoqueForm({
  produtos,
  isLoading,
  errorMessage,
  onSubmit
}: MovimentacaoEstoqueFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<MovimentacaoEstoqueFormValues>({
    resolver: zodResolver(movimentacaoEstoqueSchema),
    defaultValues: {
      produto_id: 0,
      tipo: "ENTRADA",
      quantidade: 1,
      motivo: "",
      observacao: ""
    }
  });

  const tipo = watch("tipo");

  const submitHandler: SubmitHandler<MovimentacaoEstoqueFormValues> = async (values) => {
    const critical = values.tipo === "SAIDA" || values.tipo === "AJUSTE";
    if (critical) {
      const confirmed = window.confirm("Confirma esta movimentacao de estoque?");
      if (!confirmed) {
        return;
      }
    }

    await onSubmit(values);
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submitHandler)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="produto_id">Produto*</Label>
          <select
            id="produto_id"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            {...register("produto_id", { valueAsNumber: true })}
          >
            <option value="">Selecione um produto</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.codigo} - {produto.nome} {produto.ativo ? "" : "(Inativo)"}
              </option>
            ))}
          </select>
          {errors.produto_id ? <p className="text-xs text-destructive">{errors.produto_id.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo*</Label>
          <select id="tipo" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("tipo")}>
            <option value="ENTRADA">ENTRADA</option>
            <option value="SAIDA">SAIDA</option>
            <option value="AJUSTE">AJUSTE</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade*</Label>
          <Input id="quantidade" type="number" step="0.01" min="0.01" {...register("quantidade", { valueAsNumber: true })} />
          {errors.quantidade ? <p className="text-xs text-destructive">{errors.quantidade.message}</p> : null}
          {tipo === "AJUSTE" ? (
            <p className="text-xs text-muted-foreground">No ajuste, a quantidade informada sera o novo estoque final do produto.</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivo">Motivo*</Label>
          <Input id="motivo" {...register("motivo")} />
          {errors.motivo ? <p className="text-xs text-destructive">{errors.motivo.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacao">Observacao</Label>
        <textarea
          id="observacao"
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register("observacao")}
        />
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Registrar movimentacao
        </Button>
      </div>
    </form>
  );
}
