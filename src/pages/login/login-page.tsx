import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/card";
import { appRoutes } from "@/app/constants/routes";
import { LoginForm } from "@/features/auth/components/login-form";
import { useLoginMutation } from "@/features/auth/hooks/use-login-mutation";
import { initializeDatabase } from "@/features/auth/services/auth-service";
import { LoginSchema } from "@/features/auth/validators/login-schema";
import { useAuthStore } from "@/app/store/auth-store";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const entrar = useAuthStore((state) => state.entrar);
  const estaAutenticado = useAuthStore((state) => state.estaAutenticado);
  const loginMutation = useLoginMutation();

  useEffect(() => {
    void initializeDatabase();
  }, []);

  useEffect(() => {
    if (estaAutenticado) {
      navigate(appRoutes.dashboard, { replace: true });
    }
  }, [estaAutenticado, navigate]);

  async function handleLogin(values: LoginSchema): Promise<void> {
    const response = await loginMutation.mutateAsync(values);
    entrar(response.usuario, response.token);
    navigate(appRoutes.dashboard, { replace: true });
  }

  const message = loginMutation.isError ? "Falha ao autenticar. Verifique login e senha." : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>NEXLOJA</CardTitle>
          <CardDescription>Acesse sua conta para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm isLoading={loginMutation.isPending} errorMessage={message} onSubmit={handleLogin} />
        </CardContent>
      </Card>
    </main>
  );
}
