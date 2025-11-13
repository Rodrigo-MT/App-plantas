import api from './api';
import { CareReminder } from '../types/careReminder';
import { handleApiError } from '../utils/handleApiError';

function parseDateLocal(dateString?: string | Date): Date | null {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function normalizeReminder(reminder: any): CareReminder {
  return {
    ...reminder,
    lastDone: parseDateLocal(reminder.lastDone) || null,
    nextDue: parseDateLocal(reminder.nextDue)!,
    createdAt: parseDateLocal(reminder.createdAt)!,
    updatedAt: parseDateLocal(reminder.updatedAt)!,
  };
}

export async function getCareReminders(): Promise<CareReminder[]> {
  try {
    const { data } = await api.get<CareReminder[]>('/care-reminders');
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes:', error);
    return [];
  }
}

export async function createCareReminder(
  reminder: Omit<CareReminder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CareReminder> {
  try {
    const { data } = await api.post<CareReminder>('/care-reminders', reminder);
    return normalizeReminder(data);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao criar lembrete:', message);
    throw new Error(message);
  }
}

export async function updateCareReminder(reminder: CareReminder): Promise<CareReminder> {
  try {
    const { id, ...payload } = reminder;
    const { data } = await api.patch<CareReminder>(`/care-reminders/${id}`, payload);
    return normalizeReminder(data);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao atualizar lembrete:', message);
    throw new Error(message);
  }
}

export async function deleteCareReminder(id: string): Promise<void> {
  try {
    await api.delete(`/care-reminders/${id}`);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao deletar lembrete:', message);
    throw new Error(message);
  }
}

export async function getCareRemindersByPlant(plantId: string): Promise<CareReminder[]> {
  try {
    const { data } = await api.get<CareReminder[]>(`/care-reminders?plantId=${plantId}`);
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes por planta:', error);
    return [];
  }
}

export async function getCareRemindersByType(type: string): Promise<CareReminder[]> {
  try {
    const { data } = await api.get<CareReminder[]>(`/care-reminders?type=${type}`);
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes por tipo:', error);
    return [];
  }
}

export async function getOverdueCareReminders(): Promise<CareReminder[]> {
  try {
    const { data } = await api.get<CareReminder[]>('/care-reminders/overdue');
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes atrasados:', error);
    return [];
  }
}

export async function getUpcomingCareReminders(): Promise<CareReminder[]> {
  try {
    const { data } = await api.get<CareReminder[]>('/care-reminders/upcoming');
    return data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes próximos:', error);
    return [];
  }
}

export async function markCareReminderAsDone(id: string): Promise<CareReminder> {
  try {
    const { data } = await api.patch<CareReminder>(`/care-reminders/${id}/mark-done`);
    return normalizeReminder(data);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao marcar lembrete como concluído:', message);
    throw new Error(message);
  }
}
