import { Navigate, Outlet } from "react-router-dom";
import { appRoutes } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/auth-store";
import { PerfilUsuario } from "@/features/auth/types/auth-types";

type ProtectedRouteProps = {
  allowedRoles?: PerfilUsuario[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps): JSX.Element {
  const { estaAutenticado, usuario } = useAuthStore((state) => ({
    estaAutenticado: state.estaAutenticado,
    usuario: state.usuario
  }));

  if (!estaAutenticado || !usuario) {
    return <Navigate to={appRoutes.login} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.perfil)) {
    return <Navigate to={appRoutes.dashboard} replace />;
  }

  return <Outlet />;
}
