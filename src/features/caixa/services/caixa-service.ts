import {
  abrirCaixaRepository,
  fecharCaixaRepository,
  getCaixaAtualRepository,
  listMovimentosCaixaRepository
} from "@/data/repositories/caixa-repository";
import { AbrirCaixaInput, FecharCaixaInput } from "@/domain/entities/caixa-sessao";

export function getCaixaAtualService(usuarioId: number) {
  return getCaixaAtualRepository(usuarioId);
}

export function abrirCaixaService(payload: AbrirCaixaInput) {
  return abrirCaixaRepository(payload);
}

export function fecharCaixaService(payload: FecharCaixaInput) {
  return fecharCaixaRepository(payload);
}

export function listMovimentosCaixaService(caixaSessaoId: number) {
  return listMovimentosCaixaRepository(caixaSessaoId);
}
