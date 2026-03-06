import { tauriCommand } from "@/data/db/tauri-command";
import {
  EstoqueFilters,
  EstoqueItemEntity,
  MovimentacaoEstoqueEntity,
  MovimentacaoFilters,
  ProdutoMovimentacaoOptionEntity,
  RegistrarMovimentacaoInput
} from "@/domain/entities/movimentacao-estoque";

type EstoqueRaw = {
  produtoId: number;
  codigo: string;
  nome: string;
  categoriaId: number;
  categoriaNome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  statusEstoque: "NORMAL" | "BAIXO" | "ZERADO";
  ativo: boolean;
};

type MovimentacaoRaw = {
  id: number;
  produtoId: number;
  produtoNome: string;
  produtoCodigo: string;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
  quantidade: number;
  estoqueAntes: number;
  estoqueDepois: number;
  motivo: string;
  observacao?: string | null;
  usuarioId: number;
  criadoEm: string;
};

type ProdutoOptionRaw = {
  id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
};

function fromEstoqueRaw(raw: EstoqueRaw): EstoqueItemEntity {
  return {
    produto_id: raw.produtoId,
    codigo: raw.codigo,
    nome: raw.nome,
    categoria_id: raw.categoriaId,
    categoria_nome: raw.categoriaNome,
    estoque_atual: raw.estoqueAtual,
    estoque_minimo: raw.estoqueMinimo,
    status_estoque: raw.statusEstoque,
    ativo: raw.ativo
  };
}

function fromMovimentacaoRaw(raw: MovimentacaoRaw): MovimentacaoEstoqueEntity {
  return {
    id: raw.id,
    produto_id: raw.produtoId,
    produto_nome: raw.produtoNome,
    produto_codigo: raw.produtoCodigo,
    tipo: raw.tipo,
    quantidade: raw.quantidade,
    estoque_antes: raw.estoqueAntes,
    estoque_depois: raw.estoqueDepois,
    motivo: raw.motivo,
    observacao: raw.observacao,
    usuario_id: raw.usuarioId,
    criado_em: raw.criadoEm
  };
}

function toMovimentacaoPayload(input: RegistrarMovimentacaoInput) {
  return {
    produtoId: input.produto_id,
    usuarioId: input.usuario_id,
    tipo: input.tipo,
    quantidade: input.quantidade,
    motivo: input.motivo,
    observacao: input.observacao
  };
}

export async function listEstoqueRepository(filters: EstoqueFilters): Promise<EstoqueItemEntity[]> {
  const raws = await tauriCommand<EstoqueRaw[]>("list_stock", { filters });
  return raws.map(fromEstoqueRaw);
}

export async function listProdutosMovimentacaoRepository(): Promise<ProdutoMovimentacaoOptionEntity[]> {
  return tauriCommand<ProdutoOptionRaw[]>("list_stock_products");
}

export async function listMovimentacoesEstoqueRepository(
  filters: MovimentacaoFilters
): Promise<MovimentacaoEstoqueEntity[]> {
  const raws = await tauriCommand<MovimentacaoRaw[]>("list_stock_movements", { filters });
  return raws.map(fromMovimentacaoRaw);
}

export async function registrarMovimentacaoEstoqueRepository(payload: RegistrarMovimentacaoInput): Promise<void> {
  await tauriCommand<void>("register_stock_movement", { payload: toMovimentacaoPayload(payload) });
}
