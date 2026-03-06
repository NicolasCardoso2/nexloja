import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, UsuarioSessao } from "@/features/auth/types/auth-types";

type PersistedAuth = {
  usuario: UsuarioSessao | null;
  token: string | null;
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
        token: state.token
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        state.estaAutenticado = Boolean(state.usuario && state.token);
      }
    }
  )
);
