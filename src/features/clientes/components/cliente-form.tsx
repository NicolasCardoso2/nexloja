import { LoaderCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { ClienteFormValues, clienteSchema } from "@/features/clientes/validators/cliente-schema";

type ClienteFormProps = {
  defaultValues: ClienteFormValues;
  isLoading: boolean;
  submitLabel: string;
  errorMessage?: string;
  onSubmit: (values: ClienteFormValues) => Promise<void>;
};

export function ClienteForm({ defaultValues, isLoading, submitLabel, errorMessage, onSubmit }: ClienteFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues
  });

  const submitHandler: SubmitHandler<ClienteFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submitHandler)}>
      <div className="space-y-2">
        <Label htmlFor="nome">Nome*</Label>
        <Input id="nome" {...register("nome")} />
        {errors.nome ? <p className="text-xs text-destructive">{errors.nome.message}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...register("cpf")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" {...register("telefone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco">Endereco</Label>
        <Input id="endereco" {...register("endereco")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observacoes</Label>
        <textarea
          id="observacoes"
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register("observacoes")}
        />
      </div>

      <div className="flex items-center gap-2">
        <input id="ativo" type="checkbox" className="h-4 w-4" {...register("ativo")} />
        <Label htmlFor="ativo">Cliente ativo</Label>
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
