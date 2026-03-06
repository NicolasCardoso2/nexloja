import { LoaderCircle } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { ConfiguracoesFormValues, configuracoesSchema } from "@/features/configuracoes/validators/configuracoes-schema";

type ConfiguracoesFormProps = {
  defaultValues: ConfiguracoesFormValues;
  isLoading: boolean;
  feedback?: { type: "success" | "error"; message: string };
  onSubmit: (values: ConfiguracoesFormValues) => Promise<void>;
};

export function ConfiguracoesForm({ defaultValues, isLoading, feedback, onSubmit }: ConfiguracoesFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ConfiguracoesFormValues>({
    resolver: zodResolver(configuracoesSchema),
    defaultValues
  });

  const submitHandler: SubmitHandler<ConfiguracoesFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(submitHandler)}>
      <section className="grid gap-4 rounded-lg border bg-card p-4">
        <h2 className="text-base font-semibold">Dados da loja</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome_loja">Nome da loja*</Label>
            <Input id="nome_loja" {...register("nome_loja")} />
            {errors.nome_loja ? <p className="text-xs text-destructive">{errors.nome_loja.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" {...register("cnpj")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="telefone">Telefone</Label><Input id="telefone" {...register("telefone")} /></div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>
        </div>

        <div className="space-y-2"><Label htmlFor="endereco">Endereco</Label><Input id="endereco" {...register("endereco")} /></div>
        <div className="space-y-2"><Label htmlFor="logo_path">Logo path</Label><Input id="logo_path" {...register("logo_path")} /></div>
      </section>

      <section className="grid gap-4 rounded-lg border bg-card p-4">
        <h2 className="text-base font-semibold">Aparencia</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tema">Tema*</Label>
            <select id="tema" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("tema")}>
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="moeda">Moeda*</Label>
            <select id="moeda" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("moeda")}>
              <option value="BRL">BRL</option>
            </select>
          </div>
        </div>
      </section>

      {feedback ? (
        <p className={feedback.type === "success" ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
          {feedback.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salvar alteracoes
        </Button>
      </div>
    </form>
  );
}
