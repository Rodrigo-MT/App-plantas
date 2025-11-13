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
import { CareLog } from '../types/careLog';
import { handleApiError } from '../utils/handleApiError';

/**
 * Hook para gerenciar logs de cuidados.
 */
export function useCareLogs() {
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Carrega todos os logs */
  const loadCareLogs = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getCareLogs();
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs:', err);
      setError(handleApiError(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  /** Filtra logs por planta */
  const loadCareLogsByPlant = useCallback(async (plantId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareLogsByPlant(plantId);
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs da planta:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Filtra logs por tipo de cuidado */
  const loadCareLogsByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareLogsByType(type);
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs por tipo:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Carrega logs recentes (últimos 30 dias) */
  const loadRecentCareLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecentCareLogs();
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs recentes:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Carrega logs bem-sucedidos */
  const loadSuccessfulCareLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuccessfulCareLogs();
      setCareLogs(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar logs bem-sucedidos:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Carrega estatísticas dos tipos de cuidados */
  const loadCareLogsStats = useCallback(async (): Promise<{ type: string; count: number }[]> => {
    try {
      const stats = await getCareLogsStats();
      return stats;
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar estatísticas de logs:', err);
      setError(handleApiError(err));
      throw err;
    }
  }, []);

  /** Recarrega automaticamente ao focar na tela */
  useFocusEffect(
    useCallback(() => {
      loadCareLogs();
    }, [loadCareLogs])
  );

  /** Cria um novo log de cuidado */
  const createLog = async (
    logData: Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CareLog> => {
    try {
      setLoading(true);
      setError(null);
      const newLog = await createCareLog(logData);
      setCareLogs((prev) => [...prev, newLog]);
      return newLog;
    } catch (err: unknown) {
      console.error('❌ Erro ao criar log de cuidado:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** Atualiza um log existente */
  const updateLog = async (updatedLog: CareLog): Promise<CareLog> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateCareLog(updatedLog);
      setCareLogs((prev) => prev.map((cl) => (cl.id === updated.id ? updated : cl)));
      return updated;
    } catch (err: unknown) {
      console.error('❌ Erro ao atualizar log de cuidado:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** Deleta um log */
  const deleteLog = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteCareLog(id);
      setCareLogs((prev) => prev.filter((cl) => cl.id !== id));
    } catch (err: unknown) {
      console.error('❌ Erro ao deletar log de cuidado:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** Limpa erro */
  const clearError = () => setError(null);

  return {
    careLogs,
    refreshing,
    loading,
    error,
    loadCareLogs,
    loadCareLogsByPlant,
    loadCareLogsByType,
    loadRecentCareLogs,
    loadSuccessfulCareLogs,
    loadCareLogsStats,
    createCareLog: createLog,
    updateCareLog: updateLog,
    deleteCareLog: deleteLog,
    clearError,
  };
}
