// src/services/careReminders.service.ts
import api from './api';
import { CareReminder, CreateCareReminderData, UpdateCareReminderData } from '../types/careReminder';

/**
 * Formata Date para string YYYY-MM-DD (formato esperado pelo backend)
 */
function formatDateForAPI(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Converte string YYYY-MM-DD para Date local
 */
function parseDateFromAPI(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Normaliza lembrete recebido da API
 */
function normalizeReminder(reminder: any): CareReminder {
  return {
    id: reminder.id || reminder._id,
    plantName: reminder.plantName || reminder.plant?.name, // ✅ Pega de relação se existir
    type: reminder.type,
    frequency: reminder.frequency,
    lastDone: reminder.lastDone ? parseDateFromAPI(reminder.lastDone) : new Date(),
    nextDue: reminder.nextDue ? parseDateFromAPI(reminder.nextDue) : new Date(),
    notes: reminder.notes || undefined,
    isActive: reminder.isActive ?? true,
    createdAt: reminder.createdAt ? new Date(reminder.createdAt) : new Date(),
    updatedAt: reminder.updatedAt ? new Date(reminder.updatedAt) : new Date(),
    plantId: reminder.plantId || reminder.plant?.id,
  };
}

/**
 * Prepara dados para envio à API
 */
function prepareReminderPayload(reminder: Partial<CareReminder>): any {
  const payload: any = {
    plantName: reminder.plantName, // ✅ ENVIA O NOME DIRETAMENTE
    type: reminder.type,
    frequency: reminder.frequency,
    notes: reminder.notes || null,
    isActive: reminder.isActive ?? true,
  };

  // Formata as datas corretamente
  if (reminder.lastDone) {
    payload.lastDone = formatDateForAPI(reminder.lastDone);
  }
  if (reminder.nextDue) {
    payload.nextDue = formatDateForAPI(reminder.nextDue);
  }

  return payload;
}

/**
 * Recupera todos os lembretes da API
 */
export async function getCareReminders(): Promise<CareReminder[]> {
  try {
    const response = await api.get<CareReminder[]>('/care-reminders');
    return response.data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes:', error);
    throw error;
  }
}

/**
 * Busca lembrete por ID
 */
export async function getCareReminderById(id: string): Promise<CareReminder> {
  try {
    // Backend identifies reminders by composite key (plantName, type, nextDue).
    // We'll try to resolve locally by fetching all reminders and finding the id.
    const all = await getCareReminders();
    const found = all.find((r) => r.id === id);
    if (!found) throw new Error('Lembrete não encontrado');
    return found;
  } catch (error) {
    console.error('❌ Erro ao buscar lembrete:', error);
    throw error;
  }
}

/**
 * Cria um novo lembrete via API
 */
export async function createCareReminder(reminderData: CreateCareReminderData): Promise<CareReminder> {
  try {
    const payload = prepareReminderPayload(reminderData);
    const response = await api.post<CareReminder>('/care-reminders', payload);
    return normalizeReminder(response.data);
  } catch (error) {
    console.error('❌ Erro ao criar lembrete:', error);
    throw error;
  }
}

/**
 * Atualiza um lembrete existente via API
 */
export async function updateCareReminder(id: string, reminderData: UpdateCareReminderData): Promise<CareReminder> {
  try {
    const payload = prepareReminderPayload(reminderData);
    // Resolve composite identifier from id
    const all = await getCareReminders();
    const found = all.find((r) => r.id === id);
    if (!found) throw new Error('Lembrete não encontrado');
  const plantName = encodeURIComponent(found.plantName);
  const type = encodeURIComponent(found.type);
  const nextDue = formatDateForAPI(found.nextDue);
    const response = await api.patch<CareReminder>(`/care-reminders/${plantName}/${type}/${nextDue}`, payload);
    return normalizeReminder(response.data);
  } catch (error) {
    console.error('❌ Erro ao atualizar lembrete:', error);
    throw error;
  }
}

/**
 * Deleta um lembrete pelo ID via API
 */
export async function deleteCareReminder(id: string): Promise<void> {
  try {
    const all = await getCareReminders();
    const found = all.find((r) => r.id === id);
    if (!found) throw new Error('Lembrete não encontrado');
    const plantName = encodeURIComponent(found.plantName);
    const type = encodeURIComponent(found.type);
    const nextDue = found.nextDue.toISOString().split('T')[0];
    await api.delete(`/care-reminders/${plantName}/${type}/${nextDue}`);
  } catch (error) {
    console.error('❌ Erro ao deletar lembrete:', error);
    throw error;
  }
}

/**
 * Busca lembretes por planta (agora por NOME)
 */
export async function getCareRemindersByPlant(plantName: string): Promise<CareReminder[]> {
  try {
    const response = await api.get<CareReminder[]>(`/care-reminders?plantName=${encodeURIComponent(plantName)}`);
    return response.data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes por planta:', error);
    throw error;
  }
}

/**
 * Busca lembretes por tipo
 */
export async function getCareRemindersByType(type: string): Promise<CareReminder[]> {
  try {
    const response = await api.get<CareReminder[]>(`/care-reminders?type=${encodeURIComponent(type)}`);
    return response.data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes por tipo:', error);
    throw error;
  }
}

/**
 * Busca lembretes atrasados
 */
export async function getOverdueCareReminders(): Promise<CareReminder[]> {
  try {
    const response = await api.get<CareReminder[]>('/care-reminders/overdue');
    return response.data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes atrasados:', error);
    throw error;
  }
}

/**
 * Busca lembretes próximos (em até 3 dias)
 */
export async function getUpcomingCareReminders(): Promise<CareReminder[]> {
  try {
    const response = await api.get<CareReminder[]>('/care-reminders/upcoming');
    return response.data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes próximos:', error);
    throw error;
  }
}

/**
 * Busca lembretes ativos
 */
export async function getActiveCareReminders(): Promise<CareReminder[]> {
  try {
    const response = await api.get<CareReminder[]>('/care-reminders/active');
    return response.data.map(normalizeReminder);
  } catch (error) {
    console.error('❌ Erro ao buscar lembretes ativos:', error);
    throw error;
  }
}

/**
 * Marca um lembrete como concluído
 */
export async function markCareReminderAsDone(id: string): Promise<CareReminder> {
  try {
    const all = await getCareReminders();
    const found = all.find((r) => r.id === id);
    if (!found) throw new Error('Lembrete não encontrado');
    const plantName = encodeURIComponent(found.plantName);
    const type = encodeURIComponent(found.type);
    const nextDue = found.nextDue.toISOString().split('T')[0];
    const response = await api.patch<CareReminder>(`/care-reminders/${plantName}/${type}/${nextDue}/mark-done`);
    return normalizeReminder(response.data);
  } catch (error) {
    console.error('❌ Erro ao marcar lembrete como concluído:', error);
    throw error;
  }
}