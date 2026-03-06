export type PerfilUsuario = "ADMIN" | "VENDEDOR";

export type UsuarioSessao = {
  id: number;
  login: string;
  nome: string;
  perfil: PerfilUsuario;
};

export type AuthState = {
  usuario: UsuarioSessao | null;
  token: string | null;
  estaAutenticado: boolean;
  entrar: (usuario: UsuarioSessao, token: string) => void;
  sair: () => void;
};
