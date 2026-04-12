import { login as apiLogin, setAuthToken } from "@/services/api";
import { LoginSchema } from "@/features/auth/validators/login-schema";
import { LoginCommandResponse } from "@/features/auth/types/login-command-response";
import { UsuarioSessao } from "@/features/auth/types/auth-types";

export async function initializeDatabase(): Promise<void> {
  // Inicialização não é mais necessária (usando API)
  console.log('Database já está pronto na API');
}

// Mock user for development when API is not available
const MOCK_ADMIN_USER: UsuarioSessao = {
  id: 1,
  login: 'admin',
  nome: 'Administrador',
  perfil: 'ADMIN'
};

const MOCK_TOKEN = 'mock-jwt-token-admin-dev';

export async function loginService(payload: LoginSchema): Promise<LoginCommandResponse> {
  try {
    const resultado = await apiLogin(payload.login, payload.senha);
    setAuthToken(resultado.token);
    return { 
      token: resultado.token, 
      usuario: resultado.usuario 
    };
  } catch (error) {
    // Fallback for development: allow login with admin credentials when API is not available
    if (payload.login === 'admin' && payload.senha === 'admin123') {
      setAuthToken(MOCK_TOKEN);
      console.warn('⚠️ Using mock admin user - Backend API not available');
      return {
        token: MOCK_TOKEN,
        usuario: MOCK_ADMIN_USER
      };
    }
    throw error;
  }
}
