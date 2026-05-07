import { apiCall } from './core';

export async function obterDashboardResumo() {
  return apiCall<any>('/dashboard/resumo');
}
