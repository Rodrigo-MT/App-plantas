// src/services/plants.service.ts
import api from './api';
import { Plant, CreatePlantData, UpdatePlantData } from '../types/plant';

/**
 * Converte Date para string YYYY-MM-DD (formato esperado pelo backend)
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
 * Normaliza planta recebida da API
 */
function normalizePlant(plant: any): Plant {
  return {
    id: plant.id || plant._id,
    name: plant.name,
    speciesName: plant.speciesName || plant.species?.name, // Pega de relação se existir
    locationName: plant.locationName || plant.location?.name, // Pega de relação se existir
    purchaseDate: plant.purchaseDate ? parseDateFromAPI(plant.purchaseDate) : new Date(),
    notes: plant.notes || undefined,
    photo: plant.photo || undefined,
    createdAt: plant.createdAt ? new Date(plant.createdAt) : new Date(),
    updatedAt: plant.updatedAt ? new Date(plant.updatedAt) : new Date(),
    speciesId: plant.speciesId || plant.species?.id,
    locationId: plant.locationId || plant.location?.id,
  };
}

/**
 * Prepara dados para envio à API
 */
function preparePlantPayload(plant: Partial<Plant>): any {
  const payload: any = {
    name: plant.name,
    speciesName: plant.speciesName, // ENVIA DIRECTAMENTE O NOME
    locationName: plant.locationName, // ENVIA DIRECTAMENTE O NOME
    notes: plant.notes || null,
    photo: plant.photo || null,
  };

  // Formata a data corretamente
  if (plant.purchaseDate) {
    payload.purchaseDate = formatDateForAPI(plant.purchaseDate);
  }

  return payload;
}

/**
 * Recupera todas as plantas da API
 */
export async function getPlants(): Promise<Plant[]> {
  try {
    const response = await api.get<Plant[]>('/plants');
    return response.data.map(normalizePlant);
  } catch (error) {
    console.error('❌ Erro ao buscar plantas:', error);
    throw error; // Propaga o erro para o caller lidar
  }
}

/**
 * Cria uma nova planta via API
 */
export async function createPlant(plantData: CreatePlantData): Promise<Plant> {
  try {
    const payload = preparePlantPayload(plantData);
    const response = await api.post<Plant>('/plants', payload);
    return normalizePlant(response.data);
  } catch (error) {
    console.error('❌ Erro ao criar planta:', error);
    throw error;
  }
}

/**
 * Atualiza uma planta existente via API
 */
export async function updatePlant(id: string, plantData: UpdatePlantData): Promise<Plant> {
  try {
    const payload = preparePlantPayload(plantData);
    // Backend routes identify plants by name. If an id (UUID) was provided,
    // resolve the name first by fetching all plants.
    const isLikelyId = typeof id === 'string' && id.includes('-');
    let nameOrId = id;
    if (isLikelyId) {
      const all = await getPlants();
      const found = all.find((p) => p.id === id);
      if (!found) throw new Error('Planta não encontrada');
      nameOrId = found.name;
    }

    const response = await api.patch<Plant>(`/plants/${encodeURIComponent(nameOrId)}`, payload);
    return normalizePlant(response.data);
  } catch (error) {
    console.error('❌ Erro ao atualizar planta:', error);
    throw error;
  }
}

/**
 * Deleta uma planta pelo ID via API
 */
export async function deletePlant(id: string): Promise<void> {
  try {
    const isLikelyId = typeof id === 'string' && id.includes('-');
    let nameOrId = id;
    if (isLikelyId) {
      const all = await getPlants();
      const found = all.find((p) => p.id === id);
      if (!found) throw new Error('Planta não encontrada');
      nameOrId = found.name;
    }
    await api.delete(`/plants/${encodeURIComponent(nameOrId)}`);
  } catch (error) {
    console.error('❌ Erro ao deletar planta:', error);
    throw error;
  }
}

/**
 * Remove todas as plantas (bulk) usando endpoint do backend.
 */
export async function deleteAllPlants(): Promise<void> {
  try {
    await api.delete('/plants');
  } catch (error) {
    console.error('❌ Erro ao deletar todas as plantas:', error);
    throw error;
  }
}

/**
 * Busca planta por ID
 */
export async function getPlantById(id: string): Promise<Plant> {
  try {
    const isLikelyId = typeof id === 'string' && id.includes('-');
    if (!isLikelyId) {
      const response = await api.get<Plant>(`/plants/${encodeURIComponent(id)}`);
      return normalizePlant(response.data);
    }

    const all = await getPlants();
    const found = all.find((p) => p.id === id);
    if (!found) throw new Error('Planta não encontrada');
    const response = await api.get<Plant>(`/plants/${encodeURIComponent(found.name)}`);
    return normalizePlant(response.data);
  } catch (error) {
    console.error('❌ Erro ao buscar planta:', error);
    throw error;
  }
}

/**
 * Busca plantas por localização (agora por NOME)
 */
export async function getPlantsByLocation(locationName: string): Promise<Plant[]> {
  try {
    const response = await api.get<Plant[]>(`/plants/location/${encodeURIComponent(locationName)}`);
    return response.data.map(normalizePlant);
  } catch (error) {
    console.error('❌ Erro ao buscar plantas por localização:', error);
    throw error;
  }
}

/**
 * Busca plantas por espécie (agora por NOME)
 */
export async function getPlantsBySpecies(speciesName: string): Promise<Plant[]> {
  try {
    const response = await api.get<Plant[]>(`/plants/species/${encodeURIComponent(speciesName)}`);
    return response.data.map(normalizePlant);
  } catch (error) {
    console.error('❌ Erro ao buscar plantas por espécie:', error);
    throw error;
  }
}