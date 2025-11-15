// src/services/locations.service.ts
import api from './api';
import { Location, CreateLocationData, UpdateLocationData } from '../types/location';

/**
 * Normaliza local recebido da API
 */
function normalizeLocation(location: any): Location {
  // Normalize incoming strings to canonical enum values used by the app
  const mapType = (raw: any): Location['type'] => {
    if (!raw) return 'indoor';
    const s = String(raw).toLowerCase();
    if (s.includes('indo') || s.includes('inter') || s === 'indoor') return 'indoor';
    if (s.includes('out') || s.includes('extern') || s === 'outdoor') return 'outdoor';
    if (s.includes('garden') || s.includes('jard') || s === 'garden') return 'garden';
    if (s.includes('balcony') || s.includes('varand') || s === 'balcony') return 'balcony';
    if (s.includes('terrace') || s.includes('terra') || s === 'terrace') return 'terrace';
    return 'indoor';
  };

  const mapSunlight = (raw: any): Location['sunlight'] => {
    if (!raw) return 'partial';
    const s = String(raw).toLowerCase();
    if (s.includes('full') || s.includes('pleno') || s.includes('sol')) return 'full';
    if (s.includes('partial') || s.includes('meia') || s.includes('meia sombra')) return 'partial';
    if (s.includes('shade') || s.includes('sombra')) return 'shade';
    return 'partial';
  };

  const mapHumidity = (raw: any): Location['humidity'] => {
    if (!raw) return 'medium';
    const s = String(raw).toLowerCase();
    if (s.includes('low') || s.includes('baixa') || s.includes('baixo')) return 'low';
    if (s.includes('medium') || s.includes('média') || s.includes('media')) return 'medium';
    if (s.includes('high') || s.includes('alta') || s.includes('alto')) return 'high';
    return 'medium';
  };

  return {
    id: location.id || location._id,
    name: location.name,
    type: mapType(location.type),
    sunlight: mapSunlight(location.sunlight),
    humidity: mapHumidity(location.humidity),
    description: location.description || undefined,
    photo: location.photo || undefined,
    createdAt: location.createdAt ? new Date(location.createdAt) : new Date(),
    updatedAt: location.updatedAt ? new Date(location.updatedAt) : new Date(),
  };
}

/**
 * Recupera todas as localizações da API
 */
export async function getLocations(): Promise<Location[]> {
  try {
    const response = await api.get<Location[]>('/locations');
    return response.data.map(normalizeLocation);
  } catch (error) {
    console.error('❌ Erro ao buscar localizações:', error);
    throw error;
  }
}

/**
 * Busca localização por ID
 */
export async function getLocationById(id: string): Promise<Location> {
  try {
    const isLikelyId = typeof id === 'string' && id.includes('-');
    if (!isLikelyId) {
      const response = await api.get<Location>(`/locations/${encodeURIComponent(id)}`);
      return normalizeLocation(response.data);
    }

    const all = await getLocations();
    const found = all.find((l) => l.id === id);
    if (!found) throw new Error('Localização não encontrada');
    const response = await api.get<Location>(`/locations/${encodeURIComponent(found.name)}`);
    return normalizeLocation(response.data);
  } catch (error) {
    console.error('❌ Erro ao buscar localização:', error);
    throw error;
  }
}

/**
 * Cria uma nova localização via API
 */
export async function createLocation(locationData: CreateLocationData): Promise<Location> {
  try {
    const response = await api.post<Location>('/locations', locationData);
    return normalizeLocation(response.data);
  } catch (error) {
    console.error('❌ Erro ao criar localização:', error);
    throw error;
  }
}

/**
 * Atualiza uma localização existente via API
 */
export async function updateLocation(id: string, locationData: UpdateLocationData): Promise<Location> {
  try {
    const isLikelyId = typeof id === 'string' && id.includes('-');
    let nameOrId = id;
    if (isLikelyId) {
      const all = await getLocations();
      const found = all.find((l) => l.id === id);
      if (!found) throw new Error('Localização não encontrada');
      nameOrId = found.name;
    }
    const response = await api.patch<Location>(`/locations/${encodeURIComponent(nameOrId)}`, locationData);
    return normalizeLocation(response.data);
  } catch (error) {
    console.error('❌ Erro ao atualizar localização:', error);
    throw error;
  }
}

/**
 * Deleta uma localização pelo ID via API
 */
export async function deleteLocation(id: string): Promise<void> {
  try {
    const isLikelyId = typeof id === 'string' && id.includes('-');
    let nameOrId = id;
    if (isLikelyId) {
      const all = await getLocations();
      const found = all.find((l) => l.id === id);
      if (!found) throw new Error('Localização não encontrada');
      nameOrId = found.name;
    }
    await api.delete(`/locations/${encodeURIComponent(nameOrId)}`);
  } catch (error) {
    console.error('❌ Erro ao deletar localização:', error);
    throw error;
  }
}

/**
 * Verifica se o local pode ser removido (sem plantas associadas)
 */
export async function canRemoveLocation(id: string): Promise<{ isEmpty: boolean }> {
  try {
    const isLikelyId = typeof id === 'string' && id.includes('-');
    let nameOrId = id;
    if (isLikelyId) {
      const all = await getLocations();
      const found = all.find((l) => l.id === id);
      if (!found) throw new Error('Localização não encontrada');
      nameOrId = found.name;
    }
    const response = await api.get<{ isEmpty: boolean }>(`/locations/${encodeURIComponent(nameOrId)}/is-empty`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao verificar se local pode ser removido:', error);
    throw error;
  }
}

/**
 * Busca localizações por tipo
 */
export async function getLocationsByType(type: string): Promise<Location[]> {
  try {
    // Backend accepts query param ?type=...
    const response = await api.get<Location[]>(`/locations?type=${encodeURIComponent(type)}`);
    return response.data.map(normalizeLocation);
  } catch (error) {
    console.error('❌ Erro ao buscar localizações por tipo:', error);
    throw error;
  }
}

/**
 * Busca localizações por nível de luz solar
 */
export async function getLocationsBySunlight(sunlight: string): Promise<Location[]> {
  try {
    // Backend accepts query param ?sunlight=...
    const response = await api.get<Location[]>(`/locations?sunlight=${encodeURIComponent(sunlight)}`);
    return response.data.map(normalizeLocation);
  } catch (error) {
    console.error('❌ Erro ao buscar localizações por nível de luz:', error);
    throw error;
  }
}

/**
 * Busca estatísticas de localizações
 */
export async function getLocationStats(): Promise<{ locationId: string; locationName: string; plantCount: number }[]> {
  try {
    const response = await api.get<{ locationId: string; locationName: string; plantCount: number }[]>('/locations/stats');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de localizações:', error);
    throw error;
  }
}