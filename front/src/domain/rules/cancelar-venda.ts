import { VendaDetalheEntity } from "@/domain/entities/venda";

export function cancelarVenda(venda: VendaDetalheEntity): { podeCancelar: boolean; motivo?: string } {
  if (venda.status === "CANCELADA") {
    return { podeCancelar: false, motivo: "Venda ja cancelada." };
  }

  return { podeCancelar: true };
}
