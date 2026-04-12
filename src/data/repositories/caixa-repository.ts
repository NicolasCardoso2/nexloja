import { obterSessaoCaixaAtual, abrirCaixa as apiAbrirCaixa, fecharCaixa as apiFecharCaixa, listarMovimentacoesCaixa } from "@/services/api";
import {
  AbrirCaixaInput,
  CaixaMovimentoEntity,
  CaixaSessaoEntity,
  FecharCaixaInput
} from "@/domain/entities/caixa-sessao";

function fromCaixaRaw(raw: any): CaixaSessaoEntity {
  return {
    id: raw.id,
    usuario_id: raw.usuario_id,
    aberto_em: raw.aberto_em,
    fechado_em: raw.fechado_em,
    valor_abertura: raw.valor_abertura,
    valor_fechamento: raw.valor_fechamento,
    valor_sistema: raw.valor_sistema,
    diferenca: raw.diferenca,
    status: raw.status,
    observacao: raw.observacao,
    total_movimentos: raw.total_movimentos || 0,
    valor_final_calculado: raw.valor_final_calculado || raw.valor_fechamento || 0
  };
}

export async function getCaixaAtualRepository(): Promise<CaixaSessaoEntity | null> {
  try {
    const raw = await obterSessaoCaixaAtual();
    return raw ? fromCaixaRaw(raw) : null;
  } catch {
    return null;
  }
}

export async function abrirCaixaRepository(payload: AbrirCaixaInput): Promise<CaixaSessaoEntity> {
  const raw = await apiAbrirCaixa({
    valor_abertura: payload.valor_inicial,
    observacao: payload.observacoes
  });
  return fromCaixaRaw(raw);
}

export async function fecharCaixaRepository(payload: FecharCaixaInput): Promise<CaixaSessaoEntity> {
  const raw = await apiFecharCaixa({
    caixa_id: 1,
    valor_fechamento: payload.valor_final_informado,
    observacao: payload.observacoes
  });
  return fromCaixaRaw(raw);
}

export async function listMovimentosCaixaRepository(caixaSessaoId: number): Promise<CaixaMovimentoEntity[]> {
  try {
    const raws = await listarMovimentacoesCaixa(caixaSessaoId);
    return raws.map((raw: any) => ({
      id: raw.id,
      tipo: raw.tipo,
      valor: raw.valor,
      observacao: raw.observacao,
      criado_em: raw.criado_em
    }));
  } catch {
    return [];
  }
}
