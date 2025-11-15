// src/services/careLogs.service.ts
import api from './api';
import { CareLog, CreateCareLogData, UpdateCareLogData } from '../types/careLog';

/**
 * Formata Date para string YYYY-MM-DD (formato esperado pelo backend)
 */
function formatDateForAPI(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Converte string YYYY-MM-DD para Date local
 */
function parseDateFromAPI(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Normaliza log recebido da API
 */
function normalizeLog(log: any): CareLog {
  return {
    id: log.id || log._id,
    plantName: log.plantName || log.plant?.name, // ✅ Pega de relação se existir
    type: log.type,
    date: log.date ? parseDateFromAPI(log.date) : new Date(),
    notes: log.notes || undefined,
    success: log.success ?? true,
    createdAt: log.createdAt ? new Date(log.createdAt) : new Date(),
    updatedAt: log.updatedAt ? new Date(log.updatedAt) : new Date(),
    plantId: log.plantId || log.plant?.id,
  };
}

/**
 * Prepara dados para envio à API
 */
function prepareLogPayload(log: Partial<CareLog>): any {
  const payload: any = {
    plantName: log.plantName, // ✅ ENVIA O NOME DIRETAMENTE
    type: log.type,
    date: log.date ? formatDateForAPI(log.date) : formatDateForAPI(new Date()),
    notes: log.notes || null,
    success: log.success ?? true,
  };

  return payload;
}

/**
 * Recupera todos os logs da API
 */
export async function getCareLogs(): Promise<CareLog[]> {
  try {
    const response = await api.get<CareLog[]>('/care-logs');
    return response.data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs de cuidado:', error);
    throw error;
  }
}

/**
 * Busca log por ID
 */
export async function getCareLogById(id: string): Promise<CareLog> {
  try {
    // Backend identifies logs by composite key (plantName, type, date).
    const all = await getCareLogs();
    const found = all.find((l) => l.id === id);
    if (!found) throw new Error('Registro não encontrado');
    return found;
  } catch (error) {
    console.error('❌ Erro ao buscar log de cuidado:', error);
    throw error;
  }
}

/**
 * Cria um novo log via API
 */
export async function createCareLog(logData: CreateCareLogData): Promise<CareLog> {
  try {
    const payload = prepareLogPayload(logData);
    const response = await api.post<CareLog>('/care-logs', payload);
    return normalizeLog(response.data);
  } catch (error) {
    console.error('❌ Erro ao criar log de cuidado:', error);
    throw error;
  }
}

/**
 * Atualiza um log existente via API
 */
export async function updateCareLog(id: string, logData: UpdateCareLogData): Promise<CareLog> {
  try {
    const payload = prepareLogPayload(logData);
    // Resolve composite identifier from local data
    const all = await getCareLogs();
    const found = all.find((l) => l.id === id);
    if (!found) throw new Error('Registro não encontrado');
    const plantName = encodeURIComponent(found.plantName);
    const type = encodeURIComponent(found.type);
    const date = formatDateForAPI(found.date);
    const response = await api.patch<CareLog>(`/care-logs/${plantName}/${type}/${date}`, payload);
    return normalizeLog(response.data);
  } catch (error) {
    console.error('❌ Erro ao atualizar log de cuidado:', error);
    throw error;
  }
}

/**
 * Deleta um log pelo ID via API
 */
export async function deleteCareLog(id: string): Promise<void> {
  try {
    const all = await getCareLogs();
    const found = all.find((l) => l.id === id);
    if (!found) throw new Error('Registro não encontrado');
    const plantName = encodeURIComponent(found.plantName);
    const type = encodeURIComponent(found.type);
    const date = formatDateForAPI(found.date);
    await api.delete(`/care-logs/${plantName}/${type}/${date}`);
  } catch (error) {
    console.error('❌ Erro ao deletar log de cuidado:', error);
    throw error;
  }
}

/**
 * Busca logs por planta (agora por NOME)
 */
export async function getCareLogsByPlant(plantName: string): Promise<CareLog[]> {
  try {
    const response = await api.get<CareLog[]>(`/care-logs?plantName=${encodeURIComponent(plantName)}`);
    return response.data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs por planta:', error);
    throw error;
  }
}

/**
 * Busca logs por tipo
 */
export async function getCareLogsByType(type: string): Promise<CareLog[]> {
  try {
    const response = await api.get<CareLog[]>(`/care-logs?type=${encodeURIComponent(type)}`);
    return response.data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs por tipo:', error);
    throw error;
  }
}

/**
 * Busca logs recentes (últimos 30 dias)
 */
export async function getRecentCareLogs(): Promise<CareLog[]> {
  try {
    const response = await api.get<CareLog[]>('/care-logs/recent');
    return response.data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs recentes:', error);
    throw error;
  }
}

/**
 * Busca logs bem-sucedidos
 */
export async function getSuccessfulCareLogs(): Promise<CareLog[]> {
  try {
    const response = await api.get<CareLog[]>('/care-logs/successful');
    return response.data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs bem-sucedidos:', error);
    throw error;
  }
}

/**
 * Busca estatísticas de cuidados
 */
export async function getCareLogsStats(): Promise<{ type: string; count: number }[]> {
  try {
    const response = await api.get<{ type: string; count: number }[]>('/care-logs/stats');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de logs:', error);
    throw error;
  }
}

/**
 * Busca logs por período de tempo
 */
export async function getCareLogsByDateRange(startDate: Date, endDate: Date): Promise<CareLog[]> {
  try {
    const start = formatDateForAPI(startDate);
    const end = formatDateForAPI(endDate);
    const response = await api.get<CareLog[]>(`/care-logs/range?start=${start}&end=${end}`);
    return response.data.map(normalizeLog);
  } catch (error) {
    console.error('❌ Erro ao buscar logs por período:', error);
    throw error;
  }
}