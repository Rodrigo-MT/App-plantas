// src/services/careLogs.service.ts
import api from './api';
import { CareLog } from '../types/careLog';

/**
 * Converte string de data em objeto Date sem alterar o dia.
 */
function toLocalDate(dateString?: string): Date | null {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Normaliza campos de data de um CareLog.
 */
function normalizeLog(log: any): CareLog {
  return {
    ...log,
    date: toLocalDate(log.date),
    createdAt: new Date(log.createdAt),
    updatedAt: new Date(log.updatedAt),
  };
}

/** Recupera todos os logs de cuidados */
export async function getCareLogs(): Promise<CareLog[]> {
  try {
    const { data } = await api.get('/care-logs');
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs de cuidados:', error);
    return [];
  }
}

/** Cria um novo log de cuidado */
export async function createCareLog(
  log: Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CareLog> {
  try {
    const { data } = await api.post('/care-logs', log);
    return normalizeLog(data);
  } catch (error) {
    console.error('❌ Erro ao criar log de cuidado:', error);
    throw error;
  }
}

/** Atualiza um log de cuidado existente */
export async function updateCareLog(log: CareLog): Promise<CareLog> {
  try {
    const { id, ...payload } = log; // remove id do body para não quebrar o backend
    const { data } = await api.patch(`/care-logs/${id}`, payload);
    return normalizeLog(data);
  } catch (error) {
    console.error('❌ Erro ao atualizar log de cuidado:', error);
    throw error;
  }
}

/** Deleta um log de cuidado pelo ID */
export async function deleteCareLog(id: string): Promise<void> {
  try {
    await api.delete(`/care-logs/${id}`);
  } catch (error) {
    console.error('❌ Erro ao deletar log de cuidado:', error);
    throw error;
  }
}

/** Busca logs por planta específica */
export async function getCareLogsByPlant(plantId: string): Promise<CareLog[]> {
  try {
    const { data } = await api.get(`/care-logs?plantId=${plantId}`);
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs por planta:', error);
    return [];
  }
}

/** Busca logs por tipo de cuidado */
export async function getCareLogsByType(type: string): Promise<CareLog[]> {
  try {
    const { data } = await api.get(`/care-logs?type=${type}`);
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs por tipo:', error);
    return [];
  }
}

/** Busca logs recentes (últimos 30 dias) */
export async function getRecentCareLogs(): Promise<CareLog[]> {
  try {
    const { data } = await api.get('/care-logs/recent');
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs recentes:', error);
    return [];
  }
}

/** Busca logs bem-sucedidos */
export async function getSuccessfulCareLogs(): Promise<CareLog[]> {
  try {
    const { data } = await api.get('/care-logs/successful');
    return data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs bem-sucedidos:', error);
    return [];
  }
}

/** Busca estatísticas de cuidados agrupadas por tipo */
export async function getCareLogsStats(): Promise<{ type: string; count: number }[]> {
  try {
    const { data } = await api.get('/care-logs/stats');
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de logs de cuidado:', error);
    return [];
  }
}
