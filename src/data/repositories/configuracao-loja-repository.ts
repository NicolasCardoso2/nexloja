import { tauriCommand } from "@/data/db/tauri-command";
import { ConfiguracaoLojaEntity, UpsertConfiguracaoLojaInput } from "@/domain/entities/configuracao-loja";

type ConfiguracaoLojaRaw = {
  id: number;
  nomeLoja: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  logoPath?: string | null;
  tema: "light" | "dark";
  moeda: string;
};

function fromRaw(raw: ConfiguracaoLojaRaw): ConfiguracaoLojaEntity {
  return {
    id: raw.id,
    nome_loja: raw.nomeLoja,
    cnpj: raw.cnpj,
    telefone: raw.telefone,
    email: raw.email,
    endereco: raw.endereco,
    logo_path: raw.logoPath,
    tema: raw.tema,
    moeda: raw.moeda
  };
}

function toPayload(input: UpsertConfiguracaoLojaInput) {
  return {
    nomeLoja: input.nome_loja,
    cnpj: input.cnpj,
    telefone: input.telefone,
    email: input.email,
    endereco: input.endereco,
    logoPath: input.logo_path,
    tema: input.tema,
    moeda: input.moeda
  };
}

export async function getConfiguracaoLojaRepository(): Promise<ConfiguracaoLojaEntity> {
  const raw = await tauriCommand<ConfiguracaoLojaRaw>("get_store_configuration");
  return fromRaw(raw);
}

export async function updateConfiguracaoLojaRepository(
  payload: UpsertConfiguracaoLojaInput
): Promise<ConfiguracaoLojaEntity> {
  const raw = await tauriCommand<ConfiguracaoLojaRaw>("update_store_configuration", { payload: toPayload(payload) });
  return fromRaw(raw);
}
