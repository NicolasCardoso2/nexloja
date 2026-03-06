import { tauriCommand } from "@/data/db/tauri-command";
import { LoginSchema } from "@/features/auth/validators/login-schema";
import { LoginCommandResponse } from "@/features/auth/types/login-command-response";

export async function initializeDatabase(): Promise<void> {
  await tauriCommand<void>("initialize_database");
}

export async function loginService(payload: LoginSchema): Promise<LoginCommandResponse> {
  return tauriCommand<LoginCommandResponse>("login", payload);
}
