import api from './api';
import { CareReminder } from '../types/careReminder';

/**
 * Recupera todos os lembretes de cuidados da API.
 * @returns Lista de lembretes ou array vazio em caso de erro.
 */
export async function getCareReminders(): Promise<CareReminder[]> {
  try {
    const response = await api.get('/care-reminders');
    return response.data;
  } catch (error) {
    console.error('Error getting care reminders from API:', error);
    return [];
  }
}

/**
 * Cria um novo lembrete de cuidado via API.
 * @param reminder Dados do lembrete (sem ID, que é gerado automaticamente pelo backend).
 * @returns O lembrete criado.
 * @throws Erro se a criação falhar.
 */
export async function createCareReminder(reminder: Omit<CareReminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<CareReminder> {
  try {
    const response = await api.post('/care-reminders', reminder);
    return response.data;
  } catch (error) {
    console.error('Error creating care reminder via API:', error);
    throw error;
  }
}

/**
 * Atualiza um lembrete de cuidado existente via API.
 * @param reminder Dados atualizados do lembrete, incluindo ID.
 * @returns O lembrete atualizado.
 * @throws Erro se a atualização falhar.
 */
export async function updateCareReminder(reminder: CareReminder): Promise<CareReminder> {
  try {
    const response = await api.patch(`/care-reminders/${reminder.id}`, reminder);
    return response.data;
  } catch (error) {
    console.error('Error updating care reminder via API:', error);
    throw error;
  }
}

/**
 * Deleta um lembrete de cuidado pelo ID via API.
 * @param id ID do lembrete a ser deletado.
 * @throws Erro se a deleção falhar.
 */
export async function deleteCareReminder(id: string): Promise<void> {
  try {
    await api.delete(`/care-reminders/${id}`);
  } catch (error) {
    console.error('Error deleting care reminder via API:', error);
    throw error;
  }
}

/**
 * Busca lembretes por planta específica
 * @param plantId ID da planta
 * @returns Lembretes da planta especificada
 */
export async function getCareRemindersByPlant(plantId: string): Promise<CareReminder[]> {
  try {
    const response = await api.get(`/care-reminders?plantId=${plantId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting care reminders by plant:', error);
    return [];
  }
}

/**
 * Busca lembretes por tipo
 * @param type Tipo de cuidado
 * @returns Lembretes do tipo especificado
 */
export async function getCareRemindersByType(type: string): Promise<CareReminder[]> {
  try {
    const response = await api.get(`/care-reminders?type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Error getting care reminders by type:', error);
    return [];
  }
}

/**
 * Busca lembretes atrasados
 * @returns Lembretes com data de vencimento no passado
 */
export async function getOverdueCareReminders(): Promise<CareReminder[]> {
  try {
    const response = await api.get('/care-reminders/overdue');
    return response.data;
  } catch (error) {
    console.error('Error getting overdue care reminders:', error);
    return [];
  }
}

/**
 * Busca lembretes próximos (em até 3 dias)
 * @returns Lembretes próximos do vencimento
 */
export async function getUpcomingCareReminders(): Promise<CareReminder[]> {
  try {
    const response = await api.get('/care-reminders/upcoming');
    return response.data;
  } catch (error) {
    console.error('Error getting upcoming care reminders:', error);
    return [];
  }
}

/**
 * Busca lembretes ativos
 * @returns Lembretes ativos
 */
export async function getActiveCareReminders(): Promise<CareReminder[]> {
  try {
    const response = await api.get('/care-reminders/active');
    return response.data;
  } catch (error) {
    console.error('Error getting active care reminders:', error);
    return [];
  }
}

/**
 * Marca um lembrete como concluído
 * @param id ID do lembrete
 * @returns Lembrete atualizado
 */
export async function markCareReminderAsDone(id: string): Promise<CareReminder> {
  try {
    const response = await api.patch(`/care-reminders/${id}/mark-done`);
    return response.data;
  } catch (error) {
    console.error('Error marking care reminder as done:', error);
    throw error;
  }
}