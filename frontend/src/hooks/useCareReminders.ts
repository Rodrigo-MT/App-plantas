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
  markCareReminderAsDone,
} from '../services/careReminders.service';
import { CareReminder } from '../types/careReminder';
import { handleApiError } from '../utils/handleApiError';

export function useCareReminders() {
  const [careReminders, setCareReminders] = useState<CareReminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Carrega todos os lembretes */
  const loadCareReminders = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getCareReminders();
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes:', err);
      setError(handleApiError(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  /** Filtra lembretes por planta */
  const loadCareRemindersByPlant = useCallback(async (plantId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareRemindersByPlant(plantId);
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes da planta:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Filtra lembretes por tipo */
  const loadCareRemindersByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareRemindersByType(type);
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes por tipo:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Lembretes atrasados */
  const loadOverdueCareReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOverdueCareReminders();
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes atrasados:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Lembretes próximos */
  const loadUpcomingCareReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUpcomingCareReminders();
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes próximos:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Recarrega os lembretes ao focar na tela */
  useFocusEffect(
    useCallback(() => {
      loadCareReminders();
    }, [loadCareReminders])
  );

  /** Cria um novo lembrete */
  const createReminder = async (
    reminderData: Omit<CareReminder, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CareReminder> => {
    try {
      setLoading(true);
      setError(null);
      const newReminder = await createCareReminder(reminderData);
      setCareReminders((prev) => [...prev, newReminder]);
      return newReminder;
    } catch (err: unknown) {
      console.error('Erro ao criar lembrete:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** Atualiza um lembrete existente */
  const updateReminder = async (updatedReminder: CareReminder): Promise<CareReminder> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateCareReminder(updatedReminder);
      setCareReminders((prev) =>
        prev.map((cr) => (cr.id === updated.id ? updated : cr))
      );
      return updated;
    } catch (err: unknown) {
      console.error('Erro ao atualizar lembrete:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** Deleta um lembrete */
  const deleteReminder = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteCareReminder(id);
      setCareReminders((prev) => prev.filter((cr) => cr.id !== id));
    } catch (err: unknown) {
      console.error('Erro ao deletar lembrete:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** Marca um lembrete como concluído */
  const markReminderAsDone = async (id: string): Promise<CareReminder> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await markCareReminderAsDone(id);
      setCareReminders((prev) =>
        prev.map((cr) => (cr.id === updated.id ? updated : cr))
      );
      return updated;
    } catch (err: unknown) {
      console.error('Erro ao marcar lembrete como concluído:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** Limpa o estado de erro */
  const clearError = () => setError(null);

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
  createCareReminder: createReminder,
  updateCareReminder: updateReminder,
  deleteCareReminder: deleteReminder,
  markCareReminderAsDone: markReminderAsDone,
  clearError,
};
}
