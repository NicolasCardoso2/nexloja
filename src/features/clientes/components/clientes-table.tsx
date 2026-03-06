import { Eye, Pencil, Power } from "lucide-react";
import { ClienteListItemEntity } from "@/domain/entities/cliente";
import { Button } from "@/shared/components/button";
import { ClienteStatusBadge } from "@/features/clientes/components/cliente-status-badge";

type ClientesTableProps = {
  clientes: ClienteListItemEntity[];
  onVisualizar: (id: number) => void;
  onEditar: (id: number) => void;
  onInativar: (id: number) => void;
  isInativando: boolean;
};

export function ClientesTable({
  clientes,
  onVisualizar,
  onEditar,
  onInativar,
  isInativando
}: ClientesTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">CPF</th>
            <th className="px-4 py-3">Telefone</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="border-t">
              <td className="px-4 py-3 font-medium">{cliente.nome}</td>
              <td className="px-4 py-3">{cliente.cpf || "-"}</td>
              <td className="px-4 py-3">{cliente.telefone || "-"}</td>
              <td className="px-4 py-3">{cliente.email || "-"}</td>
              <td className="px-4 py-3">
                <ClienteStatusBadge ativo={cliente.ativo} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onVisualizar(cliente.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEditar(cliente.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isInativando || !cliente.ativo}
                    onClick={() => onInativar(cliente.id)}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
