import { tauriCommand } from "@/data/db/tauri-command";
import {
  ProdutoDetalheEntity,
  ProdutoFilters,
  ProdutoListItemEntity,
  UpsertProdutoInput
} from "@/domain/entities/produto";

type ProdutoListItemRaw = {
  id: number;
  codigo: string;
  nome: string;
  codigoBarras?: string | null;
  categoriaId: number;
  categoriaNome: string;
  precoVenda: number;
  estoqueAtual: number;
  ativo: boolean;
};

type ProdutoDetalheRaw = ProdutoListItemRaw & {
  estoqueMinimo: number;
  descricao?: string | null;
  marca?: string | null;
  precoCusto: number;
  unidade: string;
  imagemPath?: string | null;
};

type UpsertProdutoPayload = {
  codigo: string;
  nome: string;
  categoriaId: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
  codigoBarras?: string;
  descricao?: string;
  marca?: string;
  precoCusto?: number;
  unidade?: string;
  imagemPath?: string;
};

function fromProdutoListRaw(raw: ProdutoListItemRaw): ProdutoListItemEntity {
  return {
    id: raw.id,
    codigo: raw.codigo,
    nome: raw.nome,
    codigo_barras: raw.codigoBarras,
    categoria_id: raw.categoriaId,
    categoria_nome: raw.categoriaNome,
    preco_venda: raw.precoVenda,
    estoque_atual: raw.estoqueAtual,
    ativo: raw.ativo
  };
}

function fromProdutoDetalheRaw(raw: ProdutoDetalheRaw): ProdutoDetalheEntity {
  return {
    ...fromProdutoListRaw(raw),
    estoque_minimo: raw.estoqueMinimo,
    descricao: raw.descricao,
    marca: raw.marca,
    preco_custo: raw.precoCusto,
    unidade: raw.unidade,
    imagem_path: raw.imagemPath
  };
}

function toUpsertPayload(input: UpsertProdutoInput): UpsertProdutoPayload {
  return {
    codigo: input.codigo,
    nome: input.nome,
    categoriaId: input.categoria_id,
    precoVenda: input.preco_venda,
    estoqueAtual: input.estoque_atual,
    estoqueMinimo: input.estoque_minimo,
    ativo: input.ativo,
    codigoBarras: input.codigo_barras,
    descricao: input.descricao,
    marca: input.marca,
    precoCusto: input.preco_custo,
    unidade: input.unidade,
    imagemPath: input.imagem_path
  };
}

export async function listProdutosRepository(filters: ProdutoFilters): Promise<ProdutoListItemEntity[]> {
  const raws = await tauriCommand<ProdutoListItemRaw[]>("list_products", { filters });
  return raws.map(fromProdutoListRaw);
}

export async function getProdutoByIdRepository(id: number): Promise<ProdutoDetalheEntity> {
  const raw = await tauriCommand<ProdutoDetalheRaw>("get_product_by_id", { id });
  return fromProdutoDetalheRaw(raw);
}

export async function createProdutoRepository(payload: UpsertProdutoInput): Promise<number> {
  return tauriCommand<number>("create_product", { payload: toUpsertPayload(payload) });
}

export async function updateProdutoRepository(id: number, payload: UpsertProdutoInput): Promise<void> {
  await tauriCommand<void>("update_product", { id, payload: toUpsertPayload(payload) });
}

export async function deactivateProdutoRepository(id: number): Promise<void> {
  await tauriCommand<void>("deactivate_product", { id });
}
