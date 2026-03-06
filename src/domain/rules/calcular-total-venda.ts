import { ItemVendaEntity } from "@/domain/entities/item-venda";

export function calcularTotalVenda(itens: ItemVendaEntity[], desconto: number): {
  subtotal: number;
  total: number;
} {
  const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const total = Math.max(subtotal - desconto, 0);
  return { subtotal, total };
}
