import { PerfilUsuario } from "@/features/auth/types/auth-types";

export type LoginCommandResponse = {
  token: string;
  usuario: {
    id: number;
    login: string;
    nome: string;
    perfil: PerfilUsuario;
  };
};
