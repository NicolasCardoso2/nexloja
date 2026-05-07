// Aqui fica guardado quem está logado no sistema.
// Usa Zustand com persist — isso significa que os dados ficam no localStorage
// e o usuário continua logado mesmo fechando e abrindo o app.
//
// Para acessar em qualquer componente:
//   const usuario = useAuthStore(state => state.usuario)
//   const token   = useAuthStore(state => state.token)

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, UsuarioSessao } from "@/features/auth/types/auth-types";

// Só salva esses três campos no localStorage não precisa guardar as funções
type PersistedAuth = {
  usuario: UsuarioSessao | null;
  token: string | null;
  estaAutenticado: boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      estaAutenticado: false,
      entrar: (usuario, token) =>
        set({
          usuario,
          token,
          estaAutenticado: true
        }),
      sair: () =>
        set({
          usuario: null,
          token: null,
          estaAutenticado: false
        })
    }),
    {
      name: "nexloja-auth",
      partialize: (state): PersistedAuth => ({
        usuario: state.usuario,
        token: state.token,
        estaAutenticado: state.estaAutenticado
      })
    }
  )
);
