import { getDashboardResumoRepository } from "@/data/repositories/dashboard-repository";

export function getDashboardResumoService(usuarioId: number) {
  return getDashboardResumoRepository(usuarioId);
}
