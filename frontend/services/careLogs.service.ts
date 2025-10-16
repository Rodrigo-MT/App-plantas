import AsyncStorage from '@react-native-async-storage/async-storage';
import { CareLog } from '../types/careLog';

const CARE_LOGS_KEY = '@careLogs';

/**
 * Recupera todos os logs de cuidados armazenados.
 * @returns Lista de logs de cuidados ou array vazio em caso de erro.
 */
export async function getCareLogs(): Promise<CareLog[]> {
  try {
    const logs = await AsyncStorage.getItem(CARE_LOGS_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error getting care logs:', error);
    return [];
  }
}

/**
 * Cria um novo log de cuidado.
 * @param log Dados do log (sem ID, que é gerado automaticamente).
 * @returns O log criado.
 * @throws Erro se a criação falhar.
 */
export async function createCareLog(log: Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<CareLog> {
  try {
    const logs = await getCareLogs();
    const newLog: CareLog = {
      ...log,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedLogs = [...logs, newLog];
    await AsyncStorage.setItem(CARE_LOGS_KEY, JSON.stringify(updatedLogs));
    return newLog;
  } catch (error) {
    console.error('Error creating care log:', error);
    throw error;
  }
}

/**
 * Atualiza um log de cuidado existente.
 * @param log Dados atualizados do log, incluindo ID.
 * @returns O log atualizado.
 * @throws Erro se a atualização falhar.
 */
export async function updateCareLog(log: CareLog): Promise<CareLog> {
  try {
    const logs = await getCareLogs();
    const updatedLogs = logs.map((l) => (l.id === log.id ? { ...log, updatedAt: new Date() } : l));
    await AsyncStorage.setItem(CARE_LOGS_KEY, JSON.stringify(updatedLogs));
    return { ...log, updatedAt: new Date() };
  } catch (error) {
    console.error('Error updating care log:', error);
    throw error;
  }
}

/**
 * Deleta um log de cuidado pelo ID.
 * @param id ID do log a ser deletado.
 * @throws Erro se a deleção falhar.
 */
export async function deleteCareLog(id: string): Promise<void> {
  try {
    const logs = await getCareLogs();
    const updatedLogs = logs.filter((l) => l.id !== id);
    await AsyncStorage.setItem(CARE_LOGS_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error deleting care log:', error);
    throw error;
  }
}