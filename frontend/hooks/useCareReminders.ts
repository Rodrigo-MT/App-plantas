import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { createCareReminder, deleteCareReminder, getCareReminders, updateCareReminder } from '../services/careReminders.service';
import { CareReminder } from '../types/careReminder';

/**
 * Hook para gerenciar lembretes de cuidados.
 * @returns Objeto com lembretes, estado de refreshing e funções para manipular lembretes.
 */
export function useCareReminders() {
  const [careReminders, setCareReminders] = useState<CareReminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCareReminders = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getCareReminders();
      setCareReminders(data);
    } catch (error) {
      console.error('Error loading care reminders:', error);
    } finally {
      setRefreshing(false);
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
    loadCareReminders,
    /**
     * Cria um novo lembrete de cuidado.
     * @param careReminderData Dados do lembrete (sem ID).
     * @returns O lembrete criado.
     */
    createCareReminder: async (careReminderData: Omit<CareReminder, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newCareReminder = await createCareReminder(careReminderData);
        setCareReminders((prev) => [...prev, newCareReminder]);
        return newCareReminder;
      } catch (error) {
        console.error('Error creating care reminder:', error);
        throw error;
      }
    },
    /**
     * Atualiza um lembrete de cuidado existente.
     * @param updatedCareReminder Dados atualizados do lembrete.
     * @returns O lembrete atualizado.
     */
    updateCareReminder: async (updatedCareReminder: CareReminder) => {
      try {
        const updated = await updateCareReminder(updatedCareReminder);
        setCareReminders((prev) => prev.map((cr) => (cr.id === updated.id ? updated : cr)));
        return updated;
      } catch (error) {
        console.error('Error updating care reminder:', error);
        throw error;
      }
    },
    /**
     * Deleta um lembrete de cuidado.
     * @param id ID do lembrete a ser deletado.
     */
    deleteCareReminder: async (id: string) => {
      try {
        await deleteCareReminder(id);
        setCareReminders((prev) => prev.filter((cr) => cr.id !== id));
      } catch (error) {
        console.error('Error deleting care reminder:', error);
        throw error;
      }
    },
  };
}