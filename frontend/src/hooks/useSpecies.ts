import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { 
  createSpecies, 
  deleteSpecies, 
  getSpecies, 
  updateSpecies, 
  canRemoveSpecies 
} from '../services/species.service';
import { Species } from '../types/species';
import { handleApiError } from '../utils/handleApiError';

/**
 * Hook para gerenciar espécies com tratamento de erros do backend.
 */
export function useSpecies() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Carrega todas as espécies */
  const loadSpecies = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getSpecies();
      setSpecies(data);
    } catch (err: unknown) {
      console.error('Error loading species:', err);
      setError(handleApiError(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  /** Recarrega as espécies ao focar na tela */
  useFocusEffect(
    useCallback(() => {
      loadSpecies();
    }, [loadSpecies])
  );

  /** Cria uma nova espécie */
  const createSpeciesEntry = useCallback(async (speciesData: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newSpecies = await createSpecies(speciesData);
      setSpecies((prev) => [...prev, newSpecies]);
      return newSpecies;
    } catch (err: unknown) {
      console.error('Error creating species:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Atualiza uma espécie existente */
  const updateSpeciesEntry = useCallback(async (updatedSpecies: Species) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateSpecies(updatedSpecies);
      setSpecies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      return updated;
    } catch (err: unknown) {
      console.error('Error updating species:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Deleta uma espécie */
  const deleteSpeciesEntry = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteSpecies(id);
      setSpecies((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting species:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Verifica se uma espécie pode ser removida */
  const checkCanRemoveSpecies = useCallback(async (id: string): Promise<{ canBeRemoved: boolean; plantCount: number }> => {
    try {
      return await canRemoveSpecies(id);
    } catch (err: unknown) {
      console.error('Error checking if species can be removed:', err);
      setError(handleApiError(err));
      throw err;
    }
  }, []);

  /** Limpa todas as espécies personalizadas (sem plantas associadas) */
  const clearCustomSpecies = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const allSpecies = await getSpecies();
      const deletableSpecies: Species[] = [];

      for (const speciesItem of allSpecies) {
        try {
          const canRemove = await canRemoveSpecies(speciesItem.id);
          if (canRemove.canBeRemoved) deletableSpecies.push(speciesItem);
        } catch (err: unknown) {
          console.error(`Erro ao verificar espécie ${speciesItem.name}:`, err);
        }
      }

      for (const speciesItem of deletableSpecies) {
        try {
          await deleteSpecies(speciesItem.id);
        } catch (err: unknown) {
          console.error(`Erro ao remover espécie "${speciesItem.name}":`, err);
        }
      }

      await loadSpecies();
    } catch (err: unknown) {
      console.error('Error clearing custom species:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadSpecies]);

  /** Limpa o estado de erro */
  const clearError = useCallback(() => setError(null), []);

  /** Retorna a interface pública do hook */
  return {
    species,
    refreshing,
    loading,
    error,
    loadSpecies,
    createSpecies: createSpeciesEntry,
    updateSpecies: updateSpeciesEntry,
    deleteSpecies: deleteSpeciesEntry,
    canRemoveSpecies: checkCanRemoveSpecies,
    clearCustomSpecies,
    clearError,
  };
}
