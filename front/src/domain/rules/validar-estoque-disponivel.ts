import { ProdutoVendaBuscaEntity } from "@/domain/entities/venda";

export function validarEstoqueDisponivel(produto: ProdutoVendaBuscaEntity, quantidade: number): boolean {
  return quantidade > 0 && quantidade <= produto.estoque_atual;
}
