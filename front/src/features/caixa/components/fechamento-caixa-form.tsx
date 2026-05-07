import { LoaderCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaixaSessaoEntity } from "@/domain/entities/caixa-sessao";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import {
  FechamentoCaixaFormValues,
  fechamentoCaixaSchema
} from "@/features/caixa/validators/fechamento-caixa-schema";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type FechamentoCaixaFormProps = {
  sessao: CaixaSessaoEntity;
  isLoading: boolean;
  errorMessage?: string;
  onSubmit: (values: FechamentoCaixaFormValues) => Promise<void>;
};

export function FechamentoCaixaForm({ sessao, isLoading, errorMessage, onSubmit }: FechamentoCaixaFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FechamentoCaixaFormValues>({
    resolver: zodResolver(fechamentoCaixaSchema),
    defaultValues: {
      valor_final_informado: sessao.valor_final_calculado,
      observacoes: ""
    }
  });

  const valorInformado = watch("valor_final_informado");
  const diferenca = (valorInformado || 0) - sessao.valor_final_calculado;

  const submitHandler: SubmitHandler<FechamentoCaixaFormValues> = async (values) => {
    const confirmed = window.confirm("Confirma o fechamento do caixa?");
    if (!confirmed) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submitHandler)}>
      <div className="grid gap-4 md:grid-cols-2">
        <p><strong>Abertura:</strong> {sessao.aberto_em}</p>
        <p><strong>Valor inicial:</strong> {formatCurrency(sessao.valor_abertura)}</p>
        <p><strong>Total movimentos:</strong> {sessao.total_movimentos}</p>
        <p><strong>Valor final calculado:</strong> {formatCurrency(sessao.valor_final_calculado)}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor_final_informado">Valor final informado*</Label>
        <Input
          id="valor_final_informado"
          type="number"
          step="0.01"
          min="0"
          {...register("valor_final_informado", { valueAsNumber: true })}
        />
        {errors.valor_final_informado ? (
          <p className="text-xs text-destructive">{errors.valor_final_informado.message}</p>
        ) : null}
      </div>

      <p className="text-sm">
        <strong>Diferenca:</strong> {formatCurrency(diferenca)}
      </p>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observacoes</Label>
        <textarea
          id="observacoes"
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register("observacoes")}
        />
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Fechar caixa
        </Button>
      </div>
    </form>
  );
}
