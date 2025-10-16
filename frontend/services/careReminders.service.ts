import AsyncStorage from '@react-native-async-storage/async-storage';
import { CareReminder } from '../types/careReminder';

const REMINDERS_KEY = '@careReminders';

/**
 * Recupera todos os lembretes de cuidados armazenados.
 * @returns Lista de lembretes ou array vazio em caso de erro.
 */
export async function getCareReminders(): Promise<CareReminder[]> {
  try {
    const reminders = await AsyncStorage.getItem(REMINDERS_KEY);
    return reminders ? JSON.parse(reminders) : [];
  } catch (error) {
    console.error('Error getting care reminders:', error);
    return [];
  }
}

/**
 * Cria um novo lembrete de cuidado.
 * @param reminder Dados do lembrete (sem ID, que é gerado automaticamente).
 * @returns O lembrete criado.
 * @throws Erro se a criação falhar.
 */
export async function createCareReminder(reminder: Omit<CareReminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<CareReminder> {
  try {
    const reminders = await getCareReminders();
    const newReminder: CareReminder = {
      ...reminder,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedReminders = [...reminders, newReminder];
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
    return newReminder;
  } catch (error) {
    console.error('Error creating care reminder:', error);
    throw error;
  }
}

/**
 * Atualiza um lembrete de cuidado existente.
 * @param reminder Dados atualizados do lembrete, incluindo ID.
 * @returns O lembrete atualizado.
 * @throws Erro se a atualização falhar.
 */
export async function updateCareReminder(reminder: CareReminder): Promise<CareReminder> {
  try {
    const reminders = await getCareReminders();
    const updatedReminders = reminders.map((r) => (r.id === reminder.id ? { ...reminder, updatedAt: new Date() } : r));
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
    return { ...reminder, updatedAt: new Date() };
  } catch (error) {
    console.error('Error updating care reminder:', error);
    throw error;
  }
}

/**
 * Deleta um lembrete de cuidado pelo ID.
 * @param id ID do lembrete a ser deletado.
 * @throws Erro se a deleção falhar.
 */
export async function deleteCareReminder(id: string): Promise<void> {
  try {
    const reminders = await getCareReminders();
    const updatedReminders = reminders.filter((r) => r.id !== id);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
  } catch (error) {
    console.error('Error deleting care reminder:', error);
    throw error;
  }
}