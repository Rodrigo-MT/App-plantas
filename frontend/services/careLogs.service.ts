import api from './api';
import { CareLog } from '../types/careLog';

/**
 * Recupera todos os logs de cuidados da API.
 * @returns Lista de logs ou array vazio em caso de erro.
 */
export async function getCareLogs(): Promise<CareLog[]> {
  try {
    const response = await api.get('/care-logs');
    return response.data;
  } catch (error) {
    console.error('Error getting care logs from API:', error);
    return [];
  }
}

/**
 * Cria um novo log de cuidado via API.
 * @param log Dados do log (sem ID, que é gerado automaticamente pelo backend).
 * @returns O log criado.
 * @throws Erro se a criação falhar.
 */
export async function createCareLog(log: Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<CareLog> {
  try {
    const response = await api.post('/care-logs', log);
    return response.data;
  } catch (error) {
    console.error('Error creating care log via API:', error);
    throw error;
  }
}

/**
 * Atualiza um log de cuidado existente via API.
 * @param log Dados atualizados do log, incluindo ID.
 * @returns O log atualizado.
 * @throws Erro se a atualização falhar.
 */
export async function updateCareLog(log: CareLog): Promise<CareLog> {
  try {
    const response = await api.patch(`/care-logs/${log.id}`, log);
    return response.data;
  } catch (error) {
    console.error('Error updating care log via API:', error);
    throw error;
  }
}

/**
 * Deleta um log de cuidado pelo ID via API.
 * @param id ID do log a ser deletado.
 * @throws Erro se a deleção falhar.
 */
export async function deleteCareLog(id: string): Promise<void> {
  try {
    await api.delete(`/care-logs/${id}`);
  } catch (error) {
    console.error('Error deleting care log via API:', error);
    throw error;
  }
}

/**
 * Busca logs por planta específica
 * @param plantId ID da planta
 * @returns Logs da planta especificada
 */
export async function getCareLogsByPlant(plantId: string): Promise<CareLog[]> {
  try {
    const response = await api.get(`/care-logs?plantId=${plantId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting care logs by plant:', error);
    return [];
  }
}

/**
 * Busca logs por tipo de cuidado
 * @param type Tipo de cuidado
 * @returns Logs do tipo especificado
 */
export async function getCareLogsByType(type: string): Promise<CareLog[]> {
  try {
    const response = await api.get(`/care-logs?type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Error getting care logs by type:', error);
    return [];
  }
}

/**
 * Busca logs recentes (últimos 30 dias)
 * @returns Logs dos últimos 30 dias
 */
export async function getRecentCareLogs(): Promise<CareLog[]> {
  try {
    const response = await api.get('/care-logs/recent');
    return response.data;
  } catch (error) {
    console.error('Error getting recent care logs:', error);
    return [];
  }
}

/**
 * Busca logs bem-sucedidos
 * @returns Logs com sucesso = true
 */
export async function getSuccessfulCareLogs(): Promise<CareLog[]> {
  try {
    const response = await api.get('/care-logs/successful');
    return response.data;
  } catch (error) {
    console.error('Error getting successful care logs:', error);
    return [];
  }
}

/**
 * Busca estatísticas de cuidados
 * @returns Contagem de cuidados por tipo
 */
export async function getCareLogsStats(): Promise<{ type: string; count: number }[]> {
  try {
    const response = await api.get('/care-logs/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting care logs stats:', error);
    return [];
  }
}