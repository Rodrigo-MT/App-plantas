import api from './api';
import { CareReminder } from '../types/careReminder';

/**
 * Converte string de data em Date local sem alterar o dia.
 */
function parseDateLocal(dateString?: string | Date): Date | null {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // hora 12 evita problema de fuso
}

/**
 * Normaliza campos de data de um lembrete.
 */
function normalizeReminder(reminder: any): CareReminder {
  return {
    ...reminder,
    lastDone: parseDateLocal(reminder.lastDone),
    nextDue: parseDateLocal(reminder.nextDue),
    createdAt: parseDateLocal(reminder.createdAt)!,
    updatedAt: parseDateLocal(reminder.updatedAt)!,
  };
}

/** Recupera todos os lembretes */
export async function getCareReminders(): Promise<CareReminder[]> {
  try {
    const { data } = await api.get('/care-reminders');
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes:', error);
    return [];
  }
}

/** Cria um novo lembrete */
export async function createCareReminder(
  reminder: Omit<CareReminder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CareReminder> {
  try {
    const { data } = await api.post('/care-reminders', reminder);
    return normalizeReminder(data);
  } catch (error) {
    console.error('❌ Erro ao criar lembrete:', error);
    throw error;
  }
}

/** Atualiza um lembrete existente */
export async function updateCareReminder(reminder: CareReminder): Promise<CareReminder> {
  try {
    const { id, ...payload } = reminder;
    const { data } = await api.patch(`/care-reminders/${id}`, payload);
    return normalizeReminder(data);
  } catch (error) {
    console.error('❌ Erro ao atualizar lembrete:', error);
    throw error;
  }
}

/** Deleta um lembrete pelo ID */
export async function deleteCareReminder(id: string): Promise<void> {
  try {
    await api.delete(`/care-reminders/${id}`);
  } catch (error) {
    console.error('❌ Erro ao deletar lembrete:', error);
    throw error;
  }
}

/** Busca lembretes por planta */
export async function getCareRemindersByPlant(plantId: string): Promise<CareReminder[]> {
  try {
    const { data } = await api.get(`/care-reminders?plantId=${plantId}`);
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes por planta:', error);
    return [];
  }
}

/** Busca lembretes por tipo */
export async function getCareRemindersByType(type: string): Promise<CareReminder[]> {
  try {
    const { data } = await api.get(`/care-reminders?type=${type}`);
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes por tipo:', error);
    return [];
  }
}

/** Busca lembretes atrasados */
export async function getOverdueCareReminders(): Promise<CareReminder[]> {
  try {
    const { data } = await api.get('/care-reminders/overdue');
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes atrasados:', error);
    return [];
  }
}

/** Busca lembretes próximos */
export async function getUpcomingCareReminders(): Promise<CareReminder[]> {
  try {
    const { data } = await api.get('/care-reminders/upcoming');
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes próximos:', error);
    return [];
  }
}

/** Marca um lembrete como concluído */
export async function markCareReminderAsDone(id: string): Promise<CareReminder> {
  try {
    const { data } = await api.patch(`/care-reminders/${id}/mark-done`);
    return normalizeReminder(data);
  } catch (error) {
    console.error('❌ Erro ao marcar lembrete como concluído:', error);
    throw error;
  }
}
