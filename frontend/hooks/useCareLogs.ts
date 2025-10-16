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
  getCareLogsStats
} from '../services/careLogs.service';
import { CareLog } from '../types/careLog';

/**
 * Hook para gerenciar logs de cuidados.
 * @returns Objeto com logs, estado de loading/error e funções para manipular logs.
 */
export function useCareLogs() {
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCareLogs = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getCareLogs();
      setCareLogs(data);
    } catch (error) {
      console.error('Error loading care logs:', error);
      setError('Erro ao carregar logs de cuidados');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadCareLogsByPlant = useCallback(async (plantId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareLogsByPlant(plantId);
      setCareLogs(data);
    } catch (error) {
      console.error('Error loading care logs by plant:', error);
      setError('Erro ao carregar logs da planta');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCareLogsByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareLogsByType(type);
      setCareLogs(data);
    } catch (error) {
      console.error('Error loading care logs by type:', error);
      setError('Erro ao carregar logs por tipo');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecentCareLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecentCareLogs();
      setCareLogs(data);
    } catch (error) {
      console.error('Error loading recent care logs:', error);
      setError('Erro ao carregar logs recentes');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuccessfulCareLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuccessfulCareLogs();
      setCareLogs(data);
    } catch (error) {
      console.error('Error loading successful care logs:', error);
      setError('Erro ao carregar logs bem-sucedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCareLogsStats = useCallback(async (): Promise<{ type: string; count: number }[]> => {
    try {
      return await getCareLogsStats();
    } catch (error) {
      console.error('Error loading care logs stats:', error);
      throw error;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCareLogs();
    }, [loadCareLogs])
  );

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
    /**
     * Cria um novo log de cuidado.
     * @param careLogData Dados do log (sem ID).
     * @returns O log criado.
     */
    createCareLog: async (careLogData: Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setLoading(true);
        setError(null);
        const newCareLog = await createCareLog(careLogData);
        setCareLogs((prev) => [...prev, newCareLog]);
        return newCareLog;
      } catch (error) {
        console.error('Error creating care log:', error);
        setError('Erro ao criar log de cuidado');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Atualiza um log de cuidado existente.
     * @param updatedCareLog Dados atualizados do log.
     * @returns O log atualizado.
     */
    updateCareLog: async (updatedCareLog: CareLog) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await updateCareLog(updatedCareLog);
        setCareLogs((prev) => prev.map((cl) => (cl.id === updated.id ? updated : cl)));
        return updated;
      } catch (error) {
        console.error('Error updating care log:', error);
        setError('Erro ao atualizar log de cuidado');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Deleta um log de cuidado.
     * @param id ID do log a ser deletado.
     */
    deleteCareLog: async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await deleteCareLog(id);
        setCareLogs((prev) => prev.filter((cl) => cl.id !== id));
      } catch (error) {
        console.error('Error deleting care log:', error);
        setError('Erro ao deletar log de cuidado');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Limpa o estado de erro
     */
    clearError: () => setError(null),
  };
}