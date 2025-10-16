import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { 
  createCareReminder, 
  deleteCareReminder, 
  getCareReminders, 
  updateCareReminder,
  getCareRemindersByPlant,
  getCareRemindersByType,
  getOverdueCareReminders,
  getUpcomingCareReminders,
  getActiveCareReminders,
  markCareReminderAsDone
} from '../services/careReminders.service';
import { CareReminder } from '../types/careReminder';

/**
 * Hook para gerenciar lembretes de cuidados.
 * @returns Objeto com lembretes, estado de loading/error e funções para manipular lembretes.
 */
export function useCareReminders() {
  const [careReminders, setCareReminders] = useState<CareReminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCareReminders = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getCareReminders();
      setCareReminders(data);
    } catch (error) {
      console.error('Error loading care reminders:', error);
      setError('Erro ao carregar lembretes');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadCareRemindersByPlant = useCallback(async (plantId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareRemindersByPlant(plantId);
      setCareReminders(data);
    } catch (error) {
      console.error('Error loading care reminders by plant:', error);
      setError('Erro ao carregar lembretes da planta');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCareRemindersByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareRemindersByType(type);
      setCareReminders(data);
    } catch (error) {
      console.error('Error loading care reminders by type:', error);
      setError('Erro ao carregar lembretes por tipo');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOverdueCareReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOverdueCareReminders();
      setCareReminders(data);
    } catch (error) {
      console.error('Error loading overdue care reminders:', error);
      setError('Erro ao carregar lembretes atrasados');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUpcomingCareReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUpcomingCareReminders();
      setCareReminders(data);
    } catch (error) {
      console.error('Error loading upcoming care reminders:', error);
      setError('Erro ao carregar lembretes próximos');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActiveCareReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveCareReminders();
      setCareReminders(data);
    } catch (error) {
      console.error('Error loading active care reminders:', error);
      setError('Erro ao carregar lembretes ativos');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCareReminders();
    }, [loadCareReminders])
  );

  return {
    careReminders,
    refreshing,
    loading,
    error,
    loadCareReminders,
    loadCareRemindersByPlant,
    loadCareRemindersByType,
    loadOverdueCareReminders,
    loadUpcomingCareReminders,
    loadActiveCareReminders,
    /**
     * Cria um novo lembrete de cuidado.
     * @param careReminderData Dados do lembrete (sem ID).
     * @returns O lembrete criado.
     */
    createCareReminder: async (careReminderData: Omit<CareReminder, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setLoading(true);
        setError(null);
        const newCareReminder = await createCareReminder(careReminderData);
        setCareReminders((prev) => [...prev, newCareReminder]);
        return newCareReminder;
      } catch (error) {
        console.error('Error creating care reminder:', error);
        setError('Erro ao criar lembrete');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Atualiza um lembrete de cuidado existente.
     * @param updatedCareReminder Dados atualizados do lembrete.
     * @returns O lembrete atualizado.
     */
    updateCareReminder: async (updatedCareReminder: CareReminder) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await updateCareReminder(updatedCareReminder);
        setCareReminders((prev) => prev.map((cr) => (cr.id === updated.id ? updated : cr)));
        return updated;
      } catch (error) {
        console.error('Error updating care reminder:', error);
        setError('Erro ao atualizar lembrete');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Deleta um lembrete de cuidado.
     * @param id ID do lembrete a ser deletado.
     */
    deleteCareReminder: async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await deleteCareReminder(id);
        setCareReminders((prev) => prev.filter((cr) => cr.id !== id));
      } catch (error) {
        console.error('Error deleting care reminder:', error);
        setError('Erro ao deletar lembrete');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Marca um lembrete como concluído
     * @param id ID do lembrete
     * @returns Lembrete atualizado
     */
    markCareReminderAsDone: async (id: string): Promise<CareReminder> => {
      try {
        setLoading(true);
        setError(null);
        const updated = await markCareReminderAsDone(id);
        setCareReminders((prev) => prev.map((cr) => (cr.id === updated.id ? updated : cr)));
        return updated;
      } catch (error) {
        console.error('Error marking care reminder as done:', error);
        setError('Erro ao marcar lembrete como concluído');
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