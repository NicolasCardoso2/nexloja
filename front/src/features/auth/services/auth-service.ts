import { login as apiLogin, setAuthToken } from "@/services/api";
import { LoginSchema } from "@/features/auth/validators/login-schema";
import { LoginCommandResponse } from "@/features/auth/types/login-command-response";

export async function loginService(payload: LoginSchema): Promise<LoginCommandResponse> {
  const resultado = await apiLogin(payload.login, payload.senha);
  setAuthToken(resultado.token);
  return {
    token: resultado.token,
    usuario: resultado.usuario
  };
}
