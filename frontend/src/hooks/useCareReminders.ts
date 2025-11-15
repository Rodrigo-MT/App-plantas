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
import { CareReminder, CreateCareReminderData, UpdateCareReminderData } from '../types/careReminder';
import { handleApiError } from '../utils/handleApiError';

export function useCareReminders() {
  const [careReminders, setCareReminders] = useState<CareReminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- LOAD ALL ----------
  const loadCareReminders = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getCareReminders();
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes:', err);
      setError(handleApiError(err, 'Erro ao carregar lembretes'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ---------- LOAD BY PLANT ----------
  const loadCareRemindersByPlant = useCallback(async (plantName: string) => { // ✅ MUDOU: plantId → plantName
    try {
      setLoading(true);
      setError(null);
      const data = await getCareRemindersByPlant(plantName);
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes da planta:', err);
      setError(handleApiError(err, 'Erro ao carregar lembretes da planta'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD BY TYPE ----------
  const loadCareRemindersByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareRemindersByType(type);
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes por tipo:', err);
      setError(handleApiError(err, 'Erro ao carregar lembretes por tipo'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD OVERDUE ----------
  const loadOverdueCareReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOverdueCareReminders();
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes atrasados:', err);
      setError(handleApiError(err, 'Erro ao carregar lembretes atrasados'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD UPCOMING ----------
  const loadUpcomingCareReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUpcomingCareReminders();
      setCareReminders(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar lembretes próximos:', err);
      setError(handleApiError(err, 'Erro ao carregar lembretes próximos'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- CREATE ----------
  const createReminder = useCallback(async (
    reminderData: CreateCareReminderData // ✅ Tipo correto
  ): Promise<CareReminder> => {
    try {
      setLoading(true);
      setError(null);
      const newReminder = await createCareReminder(reminderData);
      setCareReminders((prev) => [...prev, newReminder]);
      return newReminder;
    } catch (err: unknown) {
      console.error('Erro ao criar lembrete:', err);
      const message = handleApiError(err, 'Erro ao criar lembrete');
      setError(message);
      throw new Error(message); // ✅ Throw Error consistente
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- UPDATE ----------
  const updateReminder = useCallback(async (
    id: string, 
    reminderData: UpdateCareReminderData // ✅ Assinatura corrigida
  ): Promise<CareReminder> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateCareReminder(id, reminderData); // ✅ Chama com id separado
      setCareReminders((prev) =>
        prev.map((cr) => (cr.id === updated.id ? updated : cr))
      );
      return updated;
    } catch (err: unknown) {
      console.error('Erro ao atualizar lembrete:', err);
      const message = handleApiError(err, 'Erro ao atualizar lembrete');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- DELETE ----------
  const deleteReminder = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteCareReminder(id);
      setCareReminders((prev) => prev.filter((cr) => cr.id !== id));
    } catch (err: unknown) {
      console.error('Erro ao deletar lembrete:', err);
      const message = handleApiError(err, 'Erro ao excluir lembrete');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- MARK AS DONE ----------
  const markReminderAsDone = useCallback(async (id: string): Promise<CareReminder> => {
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
      const message = handleApiError(err, 'Erro ao marcar lembrete como concluído');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- UTILITIES ----------
  const findReminderById = useCallback((id: string): CareReminder | undefined => {
    return careReminders.find(cr => cr.id === id);
  }, [careReminders]);

  const findRemindersByPlant = useCallback((plantName: string): CareReminder[] => {
    return careReminders.filter(cr => cr.plantName === plantName);
  }, [careReminders]);

  const findRemindersByType = useCallback((type: string): CareReminder[] => {
    return careReminders.filter(cr => cr.type === type);
  }, [careReminders]);

  const getActiveReminders = useCallback((): CareReminder[] => {
    return careReminders.filter(cr => cr.isActive);
  }, [careReminders]);

  const getOverdueReminders = useCallback((): CareReminder[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return careReminders.filter(cr => 
      cr.isActive && new Date(cr.nextDue) < today
    );
  }, [careReminders]);

  const getUpcomingReminders = useCallback((): CareReminder[] => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return careReminders.filter(cr => 
      cr.isActive && 
      new Date(cr.nextDue) >= today && 
      new Date(cr.nextDue) <= threeDaysFromNow
    );
  }, [careReminders]);

  const getPlantNames = useCallback((): string[] => {
    const plantNames = careReminders.map(cr => cr.plantName).filter(Boolean);
    return Array.from(new Set(plantNames)).sort();
  }, [careReminders]);

  const clearError = useCallback(() => setError(null), []);

  // ---------- AUTO LOAD ----------
  useFocusEffect(
    useCallback(() => {
      loadCareReminders();
    }, [loadCareReminders])
  );

  return {
    // Estado
    careReminders,
    refreshing,
    loading,
    error,

    // Ações de carregamento
    loadCareReminders,
    loadCareRemindersByPlant,
    loadCareRemindersByType,
    loadOverdueCareReminders,
    loadUpcomingCareReminders,

    // Ações CRUD
    createCareReminder: createReminder,
    updateCareReminder: updateReminder,
    deleteCareReminder: deleteReminder,
    markCareReminderAsDone: markReminderAsDone,

    // Utilitários
    findReminderById,
    findRemindersByPlant,
    findRemindersByType,
    getActiveReminders,
    getOverdueReminders,
    getUpcomingReminders,
    getPlantNames,
    clearError,
  };
}