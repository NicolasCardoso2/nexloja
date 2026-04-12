import { obterConfiguracaoLoja, atualizarConfiguracaoLoja } from "@/services/api";
import { ConfiguracaoLojaEntity, UpsertConfiguracaoLojaInput } from "@/domain/entities/configuracao-loja";

function fromRaw(raw: any): ConfiguracaoLojaEntity {
  return {
    id: raw.id,
    nome_loja: raw.nome_loja,
    cnpj: raw.cnpj,
    telefone: raw.telefone,
    email: raw.email,
    endereco: raw.endereco,
    logo_path: "",
    tema: "light",
    moeda: "BRL"
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
    endereco: payload.endereco
  });
  return fromRaw(raw);
}
