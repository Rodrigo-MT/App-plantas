import api from './api';
import { Species } from '../types/species';
import { handleApiError } from '../utils/handleApiError';

/**
 * Recupera todas as espécies da API.
 */
export async function getSpecies(): Promise<Species[]> {
  try {
    const response = await api.get<Species[]>('/species');
    return response.data;
  } catch (error: unknown) {
    console.error('Error getting species from API:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Cria uma nova espécie via API.
 */
export async function createSpecies(species: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>): Promise<Species> {
  try {
    const response = await api.post<Species>('/species', species);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating species via API:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Atualiza uma espécie existente via API.
 */
export async function updateSpecies(species: Species): Promise<Species> {
  try {
    const { id, ...dataWithoutId } = species;
    const response = await api.patch<Species>(`/species/${id}`, dataWithoutId);
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating species via API:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Deleta uma espécie pelo ID via API.
 */
export async function deleteSpecies(id: string): Promise<void> {
  try {
    await api.delete(`/species/${id}`);
  } catch (error: unknown) {
    console.error('Error deleting species via API:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Verifica se uma espécie pode ser removida (não tem plantas associadas)
 */
export async function canRemoveSpecies(id: string): Promise<{ canBeRemoved: boolean; plantCount: number }> {
  try {
    const response = await api.get<{ canBeRemoved: boolean; plantCount: number }>(`/species/${id}/can-remove`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error checking if species can be removed:', error);
    throw new Error(handleApiError(error));
  }
}
