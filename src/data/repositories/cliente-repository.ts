import { tauriCommand } from "@/data/db/tauri-command";
import {
  ClienteDetalheEntity,
  ClienteFilters,
  ClienteListItemEntity,
  UpsertClienteInput
} from "@/domain/entities/cliente";

type ClienteListItemRaw = {
  id: number;
  nome: string;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
  ativo: boolean;
};

type ClienteDetalheRaw = ClienteListItemRaw & {
  endereco?: string | null;
  observacoes?: string | null;
  resumoCompras: {
    quantidadeVendas: number;
    totalGasto: number;
    ultimaCompraEm?: string | null;
  };
};

type UpsertClientePayload = {
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
};

function fromClienteListRaw(raw: ClienteListItemRaw): ClienteListItemEntity {
  return {
    id: raw.id,
    nome: raw.nome,
    cpf: raw.cpf,
    telefone: raw.telefone,
    email: raw.email,
    ativo: raw.ativo
  };
}

function fromClienteDetalheRaw(raw: ClienteDetalheRaw): ClienteDetalheEntity {
  return {
    ...fromClienteListRaw(raw),
    endereco: raw.endereco,
    observacoes: raw.observacoes,
    resumo_compras: {
      quantidade_vendas: raw.resumoCompras.quantidadeVendas,
      total_gasto: raw.resumoCompras.totalGasto,
      ultima_compra_em: raw.resumoCompras.ultimaCompraEm
    }
  };
}

function toPayload(input: UpsertClienteInput): UpsertClientePayload {
  return {
    nome: input.nome,
    cpf: input.cpf,
    telefone: input.telefone,
    email: input.email,
    endereco: input.endereco,
    observacoes: input.observacoes,
    ativo: input.ativo
  };
}

export async function listClientesRepository(filters: ClienteFilters): Promise<ClienteListItemEntity[]> {
  const raws = await tauriCommand<ClienteListItemRaw[]>("list_clients", { filters });
  return raws.map(fromClienteListRaw);
}

export async function getClienteByIdRepository(id: number): Promise<ClienteDetalheEntity> {
  const raw = await tauriCommand<ClienteDetalheRaw>("get_client_by_id", { id });
  return fromClienteDetalheRaw(raw);
}

export async function createClienteRepository(payload: UpsertClienteInput): Promise<number> {
  return tauriCommand<number>("create_client", { payload: toPayload(payload) });
}

export async function updateClienteRepository(id: number, payload: UpsertClienteInput): Promise<void> {
  await tauriCommand<void>("update_client", { id, payload: toPayload(payload) });
}

export async function deactivateClienteRepository(id: number): Promise<void> {
  await tauriCommand<void>("deactivate_client", { id });
}
