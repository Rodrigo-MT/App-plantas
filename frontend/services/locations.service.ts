import api from './api';
import { Location } from '../types/location';

/**
 * Recupera todos os locais da API.
 * @returns Lista de locais ou array vazio em caso de erro.
 */
export async function getLocations(): Promise<Location[]> {
  try {
    const response = await api.get('/locations');
    return response.data;
  } catch (error) {
    console.error('Error getting locations from API:', error);
    return [];
  }
}

/**
 * Cria um novo local via API.
 * @param location Dados do local (sem ID, que é gerado automaticamente pelo backend).
 * @returns O local criado.
 * @throws Erro se a criação falhar.
 */
export async function createLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
  try {
    const response = await api.post('/locations', location);
    return response.data;
  } catch (error) {
    console.error('Error creating location via API:', error);
    throw error;
  }
}

/**
 * Atualiza um local existente via API.
 * @param location Dados atualizados do local, incluindo ID.
 * @returns O local atualizado.
 * @throws Erro se a atualização falhar.
 */
export async function updateLocation(location: Location): Promise<Location> {
  try {
    const response = await api.patch(`/locations/${location.id}`, location);
    return response.data;
  } catch (error) {
    console.error('Error updating location via API:', error);
    throw error;
  }
}

/**
 * Deleta um local pelo ID via API.
 * @param id ID do local a ser deletado.
 * @throws Erro se a deleção falhar.
 */
export async function deleteLocation(id: string): Promise<void> {
  try {
    await api.delete(`/locations/${id}`);
  } catch (error) {
    console.error('Error deleting location via API:', error);
    throw error;
  }
}

/**
 * Verifica se um local pode ser removido (não tem plantas associadas)
 * @param id ID do local
 * @returns Objeto com informação se pode ser removido
 */
export async function canRemoveLocation(id: string): Promise<{ isEmpty: boolean }> {
  try {
    const response = await api.get(`/locations/${id}/is-empty`);
    return response.data;
  } catch (error) {
    console.error('Error checking if location can be removed:', error);
    throw error;
  }
}

/**
 * Busca locais por tipo
 * @param type Tipo do local
 * @returns Lista de locais do tipo especificado
 */
export async function getLocationsByType(type: string): Promise<Location[]> {
  try {
    const response = await api.get(`/locations?type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Error getting locations by type:', error);
    return [];
  }
}

/**
 * Busca locais por nível de luz solar
 * @param sunlight Nível de luz solar
 * @returns Lista de locais com o nível de luz especificado
 */
export async function getLocationsBySunlight(sunlight: string): Promise<Location[]> {
  try {
    const response = await api.get(`/locations?sunlight=${sunlight}`);
    return response.data;
  } catch (error) {
    console.error('Error getting locations by sunlight:', error);
    return [];
  }
}