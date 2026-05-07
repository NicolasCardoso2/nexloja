// Porteiro das rotas impede acesso a quem não deve entrar.
//
// Usado de dois jeitos no app-router.tsx:
//
//   1. <ProtectedRoute />
//       Qualquer pessoa não logada vai pro /login
//
//   2. <ProtectedRoute allowedRoles={["ADMIN"]} />
//       Só admin entra. Se for outro perfil, vai pro dashboard
//        (sem mostrar mensagem de erro é intencional)
//
// O <Outlet /> é o react-router dizendo "renderiza a rota filha aqui"

import { Navigate, Outlet } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/auth-store";
import { PerfilUsuario } from "@/features/auth/types/auth-types";

type ProtectedRouteProps = {
  allowedRoles?: PerfilUsuario[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps): JSX.Element {
  const estaAutenticado = useAuthStore((state) => state.estaAutenticado);
  const usuario = useAuthStore((state) => state.usuario);

  if (!estaAutenticado || !usuario) {
    return <Navigate to={appRoutes.login} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.perfil)) {
    return <Navigate to={appRoutes.dashboard} replace />;
  }

  return <Outlet />;
}
