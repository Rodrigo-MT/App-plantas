import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { 
  createSpecies, 
  deleteSpecies, 
  getSpecies, 
  updateSpecies, 
  canRemoveSpecies 
} from '../services/species.service';
import { Species, CreateSpeciesData, UpdateSpeciesData } from '../types/species';
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
      setError(handleApiError(err, 'Erro ao carregar espécies'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  /** Cria uma nova espécie */
  const createSpeciesEntry = useCallback(async (speciesData: CreateSpeciesData) => { // ✅ Tipo correto
    try {
      setLoading(true);
      setError(null);
      const newSpecies = await createSpecies(speciesData);
      setSpecies((prev) => [...prev, newSpecies]);
      return newSpecies;
    } catch (err: unknown) {
      console.error('Error creating species:', err);
      const message = handleApiError(err, 'Erro ao criar espécie');
      setError(message);
      throw new Error(message); // ✅ Throw Error consistente
    } finally {
      setLoading(false);
    }
  }, []);

  /** Atualiza uma espécie existente */
  const updateSpeciesEntry = useCallback(async (id: string, speciesData: UpdateSpeciesData) => { // ✅ Assinatura corrigida
    try {
      setLoading(true);
      setError(null);
      const updated = await updateSpecies(id, speciesData); // ✅ Chama com id separado
      setSpecies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      return updated;
    } catch (err: unknown) {
      console.error('Error updating species:', err);
      const message = handleApiError(err, 'Erro ao atualizar espécie');
      setError(message);
      throw new Error(message);
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
      const message = handleApiError(err, 'Erro ao excluir espécie');
      setError(message);
      throw new Error(message);
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
      const message = handleApiError(err, 'Erro ao verificar se espécie pode ser excluída');
      setError(message);
      throw new Error(message);
    }
  }, []);

  /** Limpa todas as espécies personalizadas (sem plantas associadas) */
  const clearCustomSpecies = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const allSpecies = await getSpecies();
      const deletableSpecies: Species[] = [];

      // Verifica quais espécies podem ser removidas
      for (const speciesItem of allSpecies) {
        try {
          const canRemove = await canRemoveSpecies(speciesItem.id);
          if (canRemove.canBeRemoved) {
            deletableSpecies.push(speciesItem);
          }
        } catch (err: unknown) {
          console.error(`Erro ao verificar espécie ${speciesItem.name}:`, err);
        }
      }

      // Remove as espécies que podem ser deletadas
      for (const speciesItem of deletableSpecies) {
        try {
          await deleteSpecies(speciesItem.id);
        } catch (err: unknown) {
          console.error(`Erro ao remover espécie "${speciesItem.name}":`, err);
        }
      }

      // Recarrega a lista atualizada
      await loadSpecies();
    } catch (err: unknown) {
      console.error('Error clearing custom species:', err);
      const message = handleApiError(err, 'Erro ao limpar espécies personalizadas');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [loadSpecies]);

  // ---------- UTILITÁRIOS ----------
  
  /** Busca espécie por ID */
  const findSpeciesById = useCallback((id: string): Species | undefined => {
    return species.find(s => s.id === id);
  }, [species]);

  /** Busca espécie por nome */
  const findSpeciesByName = useCallback((name: string): Species | undefined => {
    return species.find(s => 
      s.name.toLowerCase() === name.toLowerCase() || 
      s.commonName?.toLowerCase() === name.toLowerCase()
    );
  }, [species]);

  /** Retorna lista de nomes de espécies (para selects) */
  const getSpeciesNames = useCallback((): string[] => {
    return species.map(s => s.name).filter(Boolean).sort();
  }, [species]);

  /** Retorna lista de espécies formatada para pickers */
  const getSpeciesOptions = useCallback(() => {
    return species.map(s => ({
      label: s.commonName ? `${s.name} (${s.commonName})` : s.name,
      value: s.name, // ✅ Para usar em selects que precisam do nome
    }));
  }, [species]);

  /** Limpa o estado de erro */
  const clearError = useCallback(() => setError(null), []);

  // ---------- AUTO LOAD ----------
  useFocusEffect(
    useCallback(() => {
      loadSpecies();
    }, [loadSpecies])
  );

  /** Retorna a interface pública do hook */
  return {
    // Estado
    species,
    refreshing,
    loading,
    error,

    // Ações principais
    loadSpecies,
    createSpecies: createSpeciesEntry,
    updateSpecies: updateSpeciesEntry,
    deleteSpecies: deleteSpeciesEntry,
    canRemoveSpecies: checkCanRemoveSpecies,
    clearCustomSpecies,
    clearError,

    // Utilitários
    findSpeciesById,
    findSpeciesByName,
    getSpeciesNames,
    getSpeciesOptions,
  };
}