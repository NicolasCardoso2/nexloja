import { getConfiguracaoLojaRepository, updateConfiguracaoLojaRepository } from "@/data/repositories/configuracao-loja-repository";
import { UpsertConfiguracaoLojaInput } from "@/domain/entities/configuracao-loja";

export function getConfiguracaoLojaService() {
  return getConfiguracaoLojaRepository();
}

export function updateConfiguracaoLojaService(payload: UpsertConfiguracaoLojaInput) {
  return updateConfiguracaoLojaRepository(payload);
}
