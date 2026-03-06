import { tauriCommand } from "@/data/db/tauri-command";
import {
  AbrirCaixaInput,
  CaixaMovimentoEntity,
  CaixaSessaoEntity,
  FecharCaixaInput
} from "@/domain/entities/caixa-sessao";

type CaixaSessaoRaw = {
  id: number;
  usuarioId: number;
  abertoEm: string;
  fechadoEm?: string | null;
  valorAbertura: number;
  valorFechamento?: number | null;
  valorSistema?: number | null;
  diferenca?: number | null;
  status: "ABERTO" | "FECHADO";
  observacao?: string | null;
  totalMovimentos: number;
  valorFinalCalculado: number;
};

type CaixaMovimentoRaw = {
  id: number;
  tipo: CaixaMovimentoEntity["tipo"];
  valor: number;
  observacao?: string | null;
  criadoEm: string;
};

function fromSessaoRaw(raw: CaixaSessaoRaw): CaixaSessaoEntity {
  return {
    id: raw.id,
    usuario_id: raw.usuarioId,
    aberto_em: raw.abertoEm,
    fechado_em: raw.fechadoEm,
    valor_abertura: raw.valorAbertura,
    valor_fechamento: raw.valorFechamento,
    valor_sistema: raw.valorSistema,
    diferenca: raw.diferenca,
    status: raw.status,
    observacao: raw.observacao,
    total_movimentos: raw.totalMovimentos,
    valor_final_calculado: raw.valorFinalCalculado
  };
}

function toAbrirPayload(input: AbrirCaixaInput) {
  return {
    usuarioId: input.usuario_id,
    valorInicial: input.valor_inicial,
    observacoes: input.observacoes
  };
}

function toFecharPayload(input: FecharCaixaInput) {
  return {
    usuarioId: input.usuario_id,
    valorFinalInformado: input.valor_final_informado,
    observacoes: input.observacoes
  };
}

export async function getCaixaAtualRepository(usuarioId: number): Promise<CaixaSessaoEntity | null> {
  const raw = await tauriCommand<CaixaSessaoRaw | null>("get_current_cash_session", { usuarioId });
  return raw ? fromSessaoRaw(raw) : null;
}

export async function abrirCaixaRepository(payload: AbrirCaixaInput): Promise<CaixaSessaoEntity> {
  const raw = await tauriCommand<CaixaSessaoRaw>("open_cash_session", { payload: toAbrirPayload(payload) });
  return fromSessaoRaw(raw);
}

export async function fecharCaixaRepository(payload: FecharCaixaInput): Promise<CaixaSessaoEntity> {
  const raw = await tauriCommand<CaixaSessaoRaw>("close_cash_session", { payload: toFecharPayload(payload) });
  return fromSessaoRaw(raw);
}

export async function listMovimentosCaixaRepository(caixaSessaoId: number): Promise<CaixaMovimentoEntity[]> {
  const raws = await tauriCommand<CaixaMovimentoRaw[]>("list_cash_movements", { caixaSessaoId });
  return raws.map((raw) => ({
    id: raw.id,
    tipo: raw.tipo,
    valor: raw.valor,
    observacao: raw.observacao,
    criado_em: raw.criadoEm
  }));
}
