import api from './api';
import { Plant } from '../types/plant';

/**
 * Recupera todas as plantas da API.
 * @returns Lista de plantas ou array vazio em caso de erro.
 */
export async function getPlants(): Promise<Plant[]> {
  try {
    const response = await api.get('/plants');
    return response.data;
  } catch (error) {
    console.error('Error getting plants from API:', error);
    return [];
  }
}

/**
 * Cria uma nova planta via API.
 * @param plant Dados da planta (sem ID, que é gerado automaticamente).
 * @returns A planta criada.
 * @throws Erro se a criação falhar.
 */
export async function createPlant(plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plant> {
  try {
    const response = await api.post('/plants', plant);
    return response.data;
  } catch (error) {
    console.error('Error creating plant via API:', error);
    throw error;
  }
}

/**
 * Atualiza uma planta existente via API.
 * @param plant Dados atualizados da planta, incluindo ID.
 * @returns A planta atualizada.
 * @throws Erro se a atualização falhar.
 */
export async function updatePlant(plant: Plant): Promise<Plant> {
  try {
    const response = await api.patch(`/plants/${plant.id}`, plant);
    return response.data;
  } catch (error) {
    console.error('Error updating plant via API:', error);
    throw error;
  }
}

/**
 * Deleta uma planta pelo ID via API.
 * @param id ID da planta a ser deletada.
 * @throws Erro se a deleção falhar.
 */
export async function deletePlant(id: string): Promise<void> {
  try {
    await api.delete(`/plants/${id}`);
  } catch (error) {
    console.error('Error deleting plant via API:', error);
    throw error;
  }
}

/**
 * Busca plantas por localização específica
 * @param locationId ID da localização
 * @returns Plantas da localização especificada
 */
export async function getPlantsByLocation(locationId: string): Promise<Plant[]> {
  try {
    const response = await api.get(`/plants/location/${locationId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting plants by location:', error);
    return [];
  }
}

/**
 * Busca plantas por espécie específica
 * @param speciesId ID da espécie
 * @returns Plantas da espécie especificada
 */
export async function getPlantsBySpecies(speciesId: string): Promise<Plant[]> {
  try {
    const response = await api.get(`/plants/species/${speciesId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting plants by species:', error);
    return [];
  }
}