import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { LoginSchema, loginSchema } from "@/features/auth/validators/login-schema";

type LoginFormProps = {
  isLoading: boolean;
  errorMessage?: string;
  onSubmit: (values: LoginSchema) => Promise<void>;
};

export function LoginForm({ isLoading, errorMessage, onSubmit }: LoginFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "admin",
      senha: "admin123"
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="login">Login</Label>
        <Input id="login" autoComplete="username" placeholder="Digite seu login" {...register("login")} />
        {errors.login ? <p className="text-xs text-destructive">{errors.login.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" type="password" autoComplete="current-password" placeholder="Digite sua senha" {...register("senha")} />
        {errors.senha ? <p className="text-xs text-destructive">{errors.senha.message}</p> : null}
      </div>
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
        Entrar
      </Button>
    </form>
  );
}
