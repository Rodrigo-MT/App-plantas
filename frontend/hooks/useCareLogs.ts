import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { createCareLog, deleteCareLog, getCareLogs, updateCareLog } from '../services/careLogs.service';
import { CareLog } from '../types/careLog';

/**
 * Hook para gerenciar logs de cuidados.
 * @returns Objeto com logs, estado de refreshing e funções para manipular logs.
 */
export function useCareLogs() {
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCareLogs = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getCareLogs();
      setCareLogs(data);
    } catch (error) {
      console.error('Error loading care logs:', error);
    } finally {
      setRefreshing(false);
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
    loadCareLogs,
    /**
     * Cria um novo log de cuidado.
     * @param careLogData Dados do log (sem ID).
     * @returns O log criado.
     */
    createCareLog: async (careLogData: Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newCareLog = await createCareLog(careLogData);
        setCareLogs((prev) => [...prev, newCareLog]);
        return newCareLog;
      } catch (error) {
        console.error('Error creating care log:', error);
        throw error;
      }
    },
    /**
     * Atualiza um log de cuidado existente.
     * @param updatedCareLog Dados atualizados do log.
     * @returns O log atualizado.
     */
    updateCareLog: async (updatedCareLog: CareLog) => {
      try {
        const updated = await updateCareLog(updatedCareLog);
        setCareLogs((prev) => prev.map((cl) => (cl.id === updated.id ? updated : cl)));
        return updated;
      } catch (error) {
        console.error('Error updating care log:', error);
        throw error;
      }
    },
    /**
     * Deleta um log de cuidado.
     * @param id ID do log a ser deletado.
     */
    deleteCareLog: async (id: string) => {
      try {
        await deleteCareLog(id);
        setCareLogs((prev) => prev.filter((cl) => cl.id !== id));
      } catch (error) {
        console.error('Error deleting care log:', error);
        throw error;
      }
    },
  };
}