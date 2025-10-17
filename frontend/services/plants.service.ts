// src/services/plants.service.ts
import api from './api';
import { Plant } from '../types/plant';

/**
 * Converte string YYYY-MM-DD para Date local (mantém o dia correto)
 * Mesma lógica que funciona no careLogs.service.ts
 */
function toLocalDate(dateString?: string): Date | null {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Normaliza planta recebida da API (mesma estrutura dos outros serviços)
 */
function normalizePlant(plant: any): Plant {
  return {
    ...plant,
    id: plant.id || plant._id,
    purchaseDate: toLocalDate(plant.purchaseDate), // Converte string → Date ao receber
    // createdAt e updatedAt o backend provavelmente já retorna como ISO string
    createdAt: plant.createdAt ? new Date(plant.createdAt) : new Date(),
    updatedAt: plant.updatedAt ? new Date(plant.updatedAt) : new Date(),
  };
}

/**
 * Recupera todas as plantas da API.
 */
export async function getPlants(): Promise<Plant[]> {
  try {
    const response = await api.get('/plants');
    return response.data.map(normalizePlant);
  } catch (error) {
    console.error('❌ Erro ao buscar plantas:', error);
    return [];
  }
}

/**
 * Cria uma nova planta via API.
 * ENVIA Date diretamente (como nos outros serviços que funcionam)
 */
export async function createPlant(
  plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Plant> {
  try {
    // ENVIA Date diretamente - backend converte para string YYYY-MM-DD
    const response = await api.post('/plants', plant);
    return normalizePlant(response.data);
  } catch (error) {
    console.error('❌ Erro ao criar planta:', error);
    throw error;
  }
}

/**
 * Atualiza uma planta existente via API.
 * CORREÇÃO: Remove ID do payload + ENVIA Date diretamente
 */
export async function updatePlant(plant: Plant): Promise<Plant> {
  try {
    const { id, ...payload } = plant; // Remove ID do body (corrige erro de edição)
    // ENVIA Date diretamente - backend lida com a conversão
    const response = await api.patch(`/plants/${id}`, payload);
    return normalizePlant(response.data);
  } catch (error) {
    console.error('❌ Erro ao atualizar planta:', error);
    throw error;
  }
}

/**
 * Deleta uma planta pelo ID via API.
 */
export async function deletePlant(id: string): Promise<void> {
  try {
    await api.delete(`/plants/${id}`);
  } catch (error) {
    console.error('❌ Erro ao deletar planta:', error);
    throw error;
  }
}

/**
 * Busca plantas por localização específica
 */
export async function getPlantsByLocation(locationId: string): Promise<Plant[]> {
  try {
    const response = await api.get(`/plants/location/${locationId}`);
    return response.data.map(normalizePlant);
  } catch (error) {
    console.error('❌ Erro ao buscar plantas por localização:', error);
    return [];
  }
}

/**
 * Busca plantas por espécie específica
 */
export async function getPlantsBySpecies(speciesId: string): Promise<Plant[]> {
  try {
    const response = await api.get(`/plants/species/${speciesId}`);
    return response.data.map(normalizePlant);
  } catch (error) {
    console.error('❌ Erro ao buscar plantas por espécie:', error);
    return [];
  }
}