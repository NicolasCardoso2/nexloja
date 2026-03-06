export type TemaLoja = "light" | "dark";

export type ConfiguracaoLojaEntity = {
  id: number;
  nome_loja: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  logo_path?: string | null;
  tema: TemaLoja;
  moeda: string;
};

export type UpsertConfiguracaoLojaInput = {
  nome_loja: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  logo_path?: string;
  tema: TemaLoja;
  moeda: string;
};
