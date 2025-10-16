import api from './api';
import { Species } from '../types/species';

/**
 * Recupera todas as espécies da API.
 * @returns Lista de espécies ou array vazio em caso de erro.
 */
export async function getSpecies(): Promise<Species[]> {
  try {
    const response = await api.get('/species');
    return response.data;
  } catch (error) {
    console.error('Error getting species from API:', error);
    return [];
  }
}

/**
 * Cria uma nova espécie via API.
 * @param species Dados da espécie (sem ID, que é gerado automaticamente pelo backend).
 * @returns A espécie criada.
 * @throws Erro se a criação falhar.
 */
export async function createSpecies(species: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>): Promise<Species> {
  try {
    const response = await api.post('/species', species);
    return response.data;
  } catch (error) {
    console.error('Error creating species via API:', error);
    throw error;
  }
}

/**
 * Atualiza uma espécie existente via API.
 * @param species Dados atualizados da espécie, incluindo ID.
 * @returns A espécie atualizada.
 * @throws Erro se a atualização falhar.
 */
export async function updateSpecies(species: Species): Promise<Species> {
  try {
    const response = await api.patch(`/species/${species.id}`, species);
    return response.data;
  } catch (error) {
    console.error('Error updating species via API:', error);
    throw error;
  }
}

/**
 * Deleta uma espécie pelo ID via API.
 * @param id ID da espécie a ser deletada.
 * @throws Erro se a deleção falhar.
 */
export async function deleteSpecies(id: string): Promise<void> {
  try {
    await api.delete(`/species/${id}`);
  } catch (error) {
    console.error('Error deleting species via API:', error);
    throw error;
  }
}

/**
 * Verifica se uma espécie pode ser removida (não tem plantas associadas)
 * @param id ID da espécie
 * @returns Objeto com informação se pode ser removida e contagem de plantas
 */
export async function canRemoveSpecies(id: string): Promise<{ canBeRemoved: boolean; plantCount: number }> {
  try {
    const response = await api.get(`/species/${id}/can-remove`);
    return response.data;
  } catch (error) {
    console.error('Error checking if species can be removed:', error);
    throw error;
  }
}