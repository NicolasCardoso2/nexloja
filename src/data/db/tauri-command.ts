import { invoke } from "@tauri-apps/api/core";

type InvokePayload = Record<string, unknown>;

export async function tauriCommand<TResult>(command: string, payload?: InvokePayload): Promise<TResult> {
  return invoke<TResult>(command, payload);
}
