// src/services/species.service.ts
import api from './api';
import { Species, CreateSpeciesData, UpdateSpeciesData } from '../types/species';

/**
 * Recupera todas as espécies da API.
 */
export async function getSpecies(): Promise<Species[]> {
  try {
    const response = await api.get<Species[]>('/species');
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Erro ao buscar espécies:', error);
    throw error;
  }
}

/**
 * Busca espécie por ID
 */
export async function getSpeciesById(id: string): Promise<Species> {
  try {
    // Backend identifica espécies por nome nas rotas; se recebemos um UUID/id,
    // precisamos resolver o nome antes de chamar o endpoint por nome.
    const isLikelyId = typeof id === 'string' && id.includes('-');
    if (!isLikelyId) {
      const response = await api.get<Species>(`/species/${encodeURIComponent(id)}`);
      return response.data;
    }

    const all = await getSpecies();
    const found = all.find((s) => s.id === id);
    if (!found) throw new Error('Espécie não encontrada');
    const response = await api.get<Species>(`/species/${encodeURIComponent(found.name)}`);
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Erro ao buscar espécie:', error);
    throw error;
  }
}

/**
 * Cria uma nova espécie via API.
 */
export async function createSpecies(speciesData: CreateSpeciesData): Promise<Species> {
  try {
    const response = await api.post<Species>('/species', speciesData);
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Erro ao criar espécie:', error);
    throw error;
  }
}

/**
 * Atualiza uma espécie existente via API.
 */
export async function updateSpecies(id: string, speciesData: UpdateSpeciesData): Promise<Species> {
  try {
    // Backend expects name in path. If caller passed an id, resolve it to name.
    const isLikelyId = typeof id === 'string' && id.includes('-');
    let nameOrId = id;
    if (isLikelyId) {
      const all = await getSpecies();
      const found = all.find((s) => s.id === id);
      if (!found) throw new Error('Espécie não encontrada');
      nameOrId = found.name;
    }

    const response = await api.patch<Species>(`/species/${encodeURIComponent(nameOrId)}`, speciesData);
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Erro ao atualizar espécie:', error);
    throw error;
  }
}

/**
 * Deleta uma espécie pelo ID via API.
 */
export async function deleteSpecies(id: string): Promise<void> {
  try {
    const isLikelyId = typeof id === 'string' && id.includes('-');
    let nameOrId = id;
    if (isLikelyId) {
      const all = await getSpecies();
      const found = all.find((s) => s.id === id);
      if (!found) throw new Error('Espécie não encontrada');
      nameOrId = found.name;
    }
    await api.delete(`/species/${encodeURIComponent(nameOrId)}`);
  } catch (error: unknown) {
    console.error('❌ Erro ao deletar espécie:', error);
    throw error;
  }
}

/**
 * Verifica se uma espécie pode ser removida (não tem plantas associadas)
 */
export async function canRemoveSpecies(id: string): Promise<{ canBeRemoved: boolean; plantCount: number }> {
  try {
    const isLikelyId = typeof id === 'string' && id.includes('-');
    let nameOrId = id;
    if (isLikelyId) {
      const all = await getSpecies();
      const found = all.find((s) => s.id === id);
      if (!found) throw new Error('Espécie não encontrada');
      nameOrId = found.name;
    }

    const response = await api.get<{ canBeRemoved: boolean; plantCount: number }>(`/species/${encodeURIComponent(nameOrId)}/can-remove`);
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Erro ao verificar se espécie pode ser removida:', error);
    throw error;
  }
}

/**
 * Busca espécie por nome (útil para autocomplete)
 */
export async function findSpeciesByName(name: string): Promise<Species | null> {
  try {
    // Backend exposes species by name at GET /species/:name
    const response = await api.get<Species>(`/species/${encodeURIComponent(name)}`);
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Erro ao buscar espécie por nome:', error);
    return null;
  }
}