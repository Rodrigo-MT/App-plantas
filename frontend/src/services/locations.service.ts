import api from './api';
import { Location } from '../types/location';
import { handleApiError } from '../utils/handleApiError';

/**
 * 🔹 Normaliza os campos de data de um local.
 */
function normalizeLocation(location: any): Location {
  const parseDateLocal = (dateString?: string | Date): Date | null => {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;

    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  return {
    ...location,
    createdAt: parseDateLocal(location.createdAt)!,
    updatedAt: parseDateLocal(location.updatedAt)!,
  };
}

/** 🔹 Recupera todos os locais da API */
export async function getLocations(): Promise<Location[]> {
  try {
    const { data } = await api.get<Location[]>('/locations');
    return data.map(normalizeLocation);
  } catch (error) {
    console.error('❌ Erro ao buscar locais:', error);
    return [];
  }
}

/** 🔹 Cria um novo local */
export async function createLocation(
  location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Location> {
  try {
    const { data } = await api.post<Location>('/locations', location);
    return normalizeLocation(data);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao criar local:', message);
    throw new Error(message);
  }
}

/** 🔹 Atualiza um local existente */
export async function updateLocation(location: Location): Promise<Location> {
  try {
    const { id, ...payload } = location;
    const { data } = await api.patch<Location>(`/locations/${id}`, payload);
    return normalizeLocation(data);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao atualizar local:', message);
    throw new Error(message);
  }
}

/** 🔹 Deleta um local pelo ID */
export async function deleteLocation(id: string): Promise<void> {
  try {
    await api.delete(`/locations/${id}`);
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao deletar local:', message);
    throw new Error(message);
  }
}

/** 🔹 Verifica se o local pode ser removido (sem plantas associadas) */
export async function canRemoveLocation(id: string): Promise<{ isEmpty: boolean }> {
  try {
    const { data } = await api.get<{ isEmpty: boolean }>(`/locations/${id}/is-empty`);
    return data;
  } catch (error) {
    const message = handleApiError(error);
    console.error('❌ Erro ao verificar se o local pode ser removido:', message);
    throw new Error(message);
  }
}

/** 🔹 Busca locais por tipo */
export async function getLocationsByType(type: string): Promise<Location[]> {
  try {
    const { data } = await api.get<Location[]>(`/locations?type=${type}`);
    return data.map(normalizeLocation);
  } catch (error) {
    console.error('❌ Erro ao buscar locais por tipo:', error);
    return [];
  }
}

/** 🔹 Busca locais por nível de luz solar */
export async function getLocationsBySunlight(sunlight: string): Promise<Location[]> {
  try {
    const { data } = await api.get<Location[]>(`/locations?sunlight=${sunlight}`);
    return data.map(normalizeLocation);
  } catch (error) {
    console.error('❌ Erro ao buscar locais por nível de luz:', error);
    return [];
  }
}
