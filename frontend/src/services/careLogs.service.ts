import api from './api';
import { CareLog } from '../types/careLog';
import { handleApiError } from '../utils/handleApiError';

/**
 * Converte uma string de data em um objeto Date (preserva dia local).
 */
function parseDateLocal(dateString?: string | Date): Date | null {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Normaliza campos de data de um log de cuidado.
 */
function normalizeLog(log: any): CareLog {
  return {
    ...log,
    date: parseDateLocal(log.date)!,
    createdAt: parseDateLocal(log.createdAt)!,
    updatedAt: parseDateLocal(log.updatedAt)!,
  };
}

/** 🔹 Recupera todos os logs de cuidados */
export async function getCareLogs(): Promise<CareLog[]> {
  try {
    const { data } = await api.get<CareLog[]>('/care-logs');
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs de cuidados:', error);
    return [];
  }
}

/** 🔹 Cria um novo log de cuidado */
export async function createCareLog(
  log: Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CareLog> {
  try {
    const payload = {
      ...log,
      date: log.date.toISOString().split('T')[0], // formato YYYY-MM-DD
    };

    const { data } = await api.post<CareLog>('/care-logs', payload);
    return normalizeLog(data);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao criar log de cuidado:', message);
    throw new Error(message);
  }
}

/** 🔹 Atualiza um log de cuidado existente */
export async function updateCareLog(log: CareLog): Promise<CareLog> {
  try {
    const { id, ...payload } = log;

    const formattedPayload = {
      ...payload,
      date: payload.date.toISOString().split('T')[0],
    };

    const { data } = await api.patch<CareLog>(`/care-logs/${id}`, formattedPayload);
    return normalizeLog(data);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao atualizar log de cuidado:', message);
    throw new Error(message);
  }
}

/** 🔹 Deleta um log de cuidado pelo ID */
export async function deleteCareLog(id: string): Promise<void> {
  try {
    await api.delete(`/care-logs/${id}`);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao deletar log de cuidado:', message);
    throw new Error(message);
  }
}

/** 🔹 Busca logs por planta específica */
export async function getCareLogsByPlant(plantId: string): Promise<CareLog[]> {
  try {
    const { data } = await api.get<CareLog[]>(`/care-logs?plantId=${plantId}`);
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs por planta:', error);
    return [];
  }
}

/** 🔹 Busca logs por tipo de cuidado */
export async function getCareLogsByType(type: string): Promise<CareLog[]> {
  try {
    const { data } = await api.get<CareLog[]>(`/care-logs?type=${type}`);
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs por tipo:', error);
    return [];
  }
}

/** 🔹 Busca logs recentes (últimos 30 dias) */
export async function getRecentCareLogs(): Promise<CareLog[]> {
  try {
    const { data } = await api.get<CareLog[]>('/care-logs/recent');
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs recentes:', error);
    return [];
  }
}

/** 🔹 Busca logs bem-sucedidos */
export async function getSuccessfulCareLogs(): Promise<CareLog[]> {
  try {
    const { data } = await api.get<CareLog[]>('/care-logs/successful');
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs bem-sucedidos:', error);
    return [];
  }
}

/** 🔹 Busca estatísticas de cuidados agrupadas por tipo */
export async function getCareLogsStats(): Promise<{ type: string; count: number }[]> {
  try {
    const { data } = await api.get<{ type: string; count: number }[]>('/care-logs/stats');
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de logs de cuidado:', error);
    return [];
  }
}
