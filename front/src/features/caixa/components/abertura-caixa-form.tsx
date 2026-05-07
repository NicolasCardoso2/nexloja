import { LoaderCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import {
  AberturaCaixaFormValues,
  aberturaCaixaSchema
} from "@/features/caixa/validators/abertura-caixa-schema";

type AberturaCaixaFormProps = {
  isLoading: boolean;
  errorMessage?: string;
  onSubmit: (values: AberturaCaixaFormValues) => Promise<void>;
};

export function AberturaCaixaForm({ isLoading, errorMessage, onSubmit }: AberturaCaixaFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AberturaCaixaFormValues>({
    resolver: zodResolver(aberturaCaixaSchema),
    defaultValues: {
      valor_inicial: 0,
      observacoes: ""
    }
  });

  const submitHandler: SubmitHandler<AberturaCaixaFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submitHandler)}>
      <div className="space-y-2">
        <Label htmlFor="valor_inicial">Valor inicial*</Label>
        <Input id="valor_inicial" type="number" step="0.01" min="0" {...register("valor_inicial", { valueAsNumber: true })} />
        {errors.valor_inicial ? <p className="text-xs text-destructive">{errors.valor_inicial.message}</p> : null}
      </div>

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
          Abrir caixa
        </Button>
      </div>
    </form>
  );
}
