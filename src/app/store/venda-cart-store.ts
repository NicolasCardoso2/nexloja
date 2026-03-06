import { create } from "zustand";
import { ProdutoVendaBuscaEntity } from "@/domain/entities/venda";
import { ItemVendaEntity } from "@/domain/entities/item-venda";

type VendaCartState = {
  itens: ItemVendaEntity[];
  adicionarItem: (produto: ProdutoVendaBuscaEntity) => void;
  alterarQuantidade: (produtoId: number, quantidade: number) => void;
  removerItem: (produtoId: number) => void;
  limpar: () => void;
};

function toItem(produto: ProdutoVendaBuscaEntity): ItemVendaEntity {
  return {
    produto_id: produto.id,
    produto_nome: produto.nome,
    produto_codigo: produto.codigo,
    quantidade: 1,
    preco_unitario: produto.preco_venda,
    subtotal: produto.preco_venda
  };
}

export const useVendaCartStore = create<VendaCartState>((set) => ({
  itens: [],
  adicionarItem: (produto) =>
    set((state) => {
      const found = state.itens.find((item) => item.produto_id === produto.id);
      if (!found) {
        return { itens: [...state.itens, toItem(produto)] };
      }

      const itens = state.itens.map((item) => {
        if (item.produto_id !== produto.id) {
          return item;
        }

        const quantidade = item.quantidade + 1;
        return {
          ...item,
          quantidade,
          subtotal: quantidade * item.preco_unitario
        };
      });

      return { itens };
    }),
  alterarQuantidade: (produtoId, quantidade) =>
    set((state) => {
      const itens = state.itens
        .map((item) => {
          if (item.produto_id !== produtoId) {
            return item;
          }

          return {
            ...item,
            quantidade,
            subtotal: quantidade * item.preco_unitario
          };
        })
        .filter((item) => item.quantidade > 0);

      return { itens };
    }),
  removerItem: (produtoId) =>
    set((state) => ({
      itens: state.itens.filter((item) => item.produto_id !== produtoId)
    })),
  limpar: () => set({ itens: [] })
}));
