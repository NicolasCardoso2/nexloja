export type CategoriaEntity = {
  id: number;
  nome: string;
};

export type ProdutoListItemEntity = {
  id: number;
  codigo: string;
  nome: string;
  categoria_id: number;
  categoria_nome: string;
  preco_venda: number;
  estoque_atual: number;
  ativo: boolean;
  codigo_barras?: string | null;
};

export type ProdutoDetalheEntity = ProdutoListItemEntity & {
  estoque_minimo: number;
  descricao?: string | null;
  marca?: string | null;
  preco_custo: number;
  unidade: string;
  imagem_path?: string | null;
};

export type ProdutoFilters = {
  query?: string;
  categoriaId?: number;
  ativo?: boolean;
};

export type UpsertProdutoInput = {
  codigo: string;
  nome: string;
  categoria_id: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: boolean;
  codigo_barras?: string;
  descricao?: string;
  marca?: string;
  preco_custo?: number;
  unidade?: string;
  imagem_path?: string;
};
