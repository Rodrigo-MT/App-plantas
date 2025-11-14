// src/hooks/useCareLogs.ts
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  createCareLog,
  deleteCareLog,
  getCareLogs,
  updateCareLog,
  getCareLogsByPlant,
  getCareLogsByType,
  getRecentCareLogs,
  getSuccessfulCareLogs,
  getCareLogsStats,
} from '../services/careLogs.service';
import { CareLog, CreateCareLogData, UpdateCareLogData } from '../types/careLog';
import { handleApiError } from '../utils/handleApiError';

/**
 * Hook para gerenciar logs de cuidados.
 */
export function useCareLogs() {
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- LOAD ALL ----------
  const loadCareLogs = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getCareLogs();
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs:', err);
      setError(handleApiError(err, 'Erro ao carregar logs de cuidado'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ---------- LOAD BY PLANT ----------
  const loadCareLogsByPlant = useCallback(async (plantName: string) => { // ✅ MUDOU: plantId → plantName
    try {
      setLoading(true);
      setError(null);
      const data = await getCareLogsByPlant(plantName);
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs da planta:', err);
      setError(handleApiError(err, 'Erro ao carregar logs da planta'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD BY TYPE ----------
  const loadCareLogsByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareLogsByType(type);
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs por tipo:', err);
      setError(handleApiError(err, 'Erro ao carregar logs por tipo'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD RECENT ----------
  const loadRecentCareLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecentCareLogs();
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs recentes:', err);
      setError(handleApiError(err, 'Erro ao carregar logs recentes'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD SUCCESSFUL ----------
  const loadSuccessfulCareLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuccessfulCareLogs();
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs bem-sucedidos:', err);
      setError(handleApiError(err, 'Erro ao carregar logs bem-sucedidos'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD STATS ----------
  const loadCareLogsStats = useCallback(async (): Promise<{ type: string; count: number }[]> => {
    try {
      const stats = await getCareLogsStats();
      return stats;
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar estatísticas de logs:', err);
      const message = handleApiError(err, 'Erro ao carregar estatísticas');
      setError(message);
      throw new Error(message);
    }
  }, []);

  // ---------- CREATE ----------
  const createLog = useCallback(async (
    logData: CreateCareLogData // ✅ Tipo correto
  ): Promise<CareLog> => {
    try {
      setLoading(true);
      setError(null);
      const newLog = await createCareLog(logData);
      setCareLogs((prev) => [...prev, newLog]);
      return newLog;
    } catch (err: unknown) {
      console.error('❌ Erro ao criar log de cuidado:', err);
      const message = handleApiError(err, 'Erro ao criar log de cuidado');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- UPDATE ----------
  const updateLog = useCallback(async (
    id: string, 
    logData: UpdateCareLogData // ✅ Assinatura corrigida
  ): Promise<CareLog> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateCareLog(id, logData); // ✅ Chama com id separado
      setCareLogs((prev) => prev.map((cl) => (cl.id === updated.id ? updated : cl)));
      return updated;
    } catch (err: unknown) {
      console.error('❌ Erro ao atualizar log de cuidado:', err);
      const message = handleApiError(err, 'Erro ao atualizar log de cuidado');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- DELETE ----------
  const deleteLog = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteCareLog(id);
      setCareLogs((prev) => prev.filter((cl) => cl.id !== id));
    } catch (err: unknown) {
      console.error('❌ Erro ao deletar log de cuidado:', err);
      const message = handleApiError(err, 'Erro ao excluir log de cuidado');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- UTILITIES ----------
  const findLogById = useCallback((id: string): CareLog | undefined => {
    return careLogs.find(cl => cl.id === id);
  }, [careLogs]);

  const findLogsByPlant = useCallback((plantName: string): CareLog[] => {
    return careLogs.filter(cl => cl.plantName === plantName);
  }, [careLogs]);

  const findLogsByType = useCallback((type: string): CareLog[] => {
    return careLogs.filter(cl => cl.type === type);
  }, [careLogs]);

  const findSuccessfulLogs = useCallback((): CareLog[] => {
    return careLogs.filter(cl => cl.success);
  }, [careLogs]);

  const findRecentLogs = useCallback((): CareLog[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return careLogs.filter(cl => new Date(cl.date) >= thirtyDaysAgo);
  }, [careLogs]);

  const getPlantNames = useCallback((): string[] => {
    const plantNames = careLogs.map(cl => cl.plantName).filter(Boolean);
    return Array.from(new Set(plantNames)).sort();
  }, [careLogs]);

  const getCareTypes = useCallback((): string[] => {
    const types = careLogs.map(cl => cl.type).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [careLogs]);

  const getStats = useCallback((): { type: string; count: number }[] => {
    const statsMap = new Map<string, number>();
    
    careLogs.forEach(log => {
      const currentCount = statsMap.get(log.type) || 0;
      statsMap.set(log.type, currentCount + 1);
    });

    return Array.from(statsMap.entries()).map(([type, count]) => ({
      type,
      count
    })).sort((a, b) => b.count - a.count);
  }, [careLogs]);

  const clearError = useCallback(() => setError(null), []);

  // ---------- AUTO LOAD ----------
  useFocusEffect(
    useCallback(() => {
      loadCareLogs();
    }, [loadCareLogs])
  );

  return {
    // Estado
    careLogs,
    refreshing,
    loading,
    error,

    // Ações de carregamento
    loadCareLogs,
    loadCareLogsByPlant,
    loadCareLogsByType,
    loadRecentCareLogs,
    loadSuccessfulCareLogs,
    loadCareLogsStats,

    // Ações CRUD
    createCareLog: createLog,
    updateCareLog: updateLog,
    deleteCareLog: deleteLog,

    // Utilitários
    findLogById,
    findLogsByPlant,
    findLogsByType,
    findSuccessfulLogs,
    findRecentLogs,
    getPlantNames,
    getCareTypes,
    getStats,
    clearError,
  };
}