import { obterConfiguracaoLoja, atualizarConfiguracaoLoja } from "@/services/api";
import { ConfiguracaoLojaEntity, UpsertConfiguracaoLojaInput } from "@/domain/entities/configuracao-loja";

function fromRaw(raw: any): ConfiguracaoLojaEntity {
  return {
    id: Number(raw?.id ?? 1),
    nome_loja: String(raw?.nome_loja ?? "Loja NexLoja"),
    cnpj: raw?.cnpj ?? "",
    telefone: raw?.telefone ?? "",
    email: raw?.email ?? "",
    endereco: raw?.endereco ?? "",
    logo_path: raw?.logo_path ?? "",
    tema: raw?.tema === "dark" ? "dark" : "light",
    moeda: String(raw?.moeda ?? "BRL")
  };
}

export async function getConfiguracaoLojaRepository(): Promise<ConfiguracaoLojaEntity> {
  try {
    const raw = await obterConfiguracaoLoja();
    return fromRaw(raw);
  } catch {
    return {
      id: 1,
      nome_loja: "Loja NexLoja",
      cnpj: "",
      telefone: "",
      email: "",
      endereco: "",
      logo_path: "",
      tema: "light",
      moeda: "BRL"
    };
  }
}

export async function updateConfiguracaoLojaRepository(
  payload: UpsertConfiguracaoLojaInput
): Promise<ConfiguracaoLojaEntity> {
  const raw = await atualizarConfiguracaoLoja({
    nome_loja: payload.nome_loja,
    cnpj: payload.cnpj,
    telefone: payload.telefone,
    email: payload.email,
    endereco: payload.endereco,
    logo_path: payload.logo_path,
    tema: payload.tema,
    moeda: payload.moeda
  });
  return fromRaw(raw);
}
