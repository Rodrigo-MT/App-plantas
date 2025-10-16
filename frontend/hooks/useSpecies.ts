import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { createSpecies, deleteSpecies, getSpecies, updateSpecies } from '../services/species.service';
import { Species } from '../types/species';

/**
 * Hook para gerenciar espécies.
 * @returns Objeto com espécies, estado de refreshing e funções para manipular espécies.
 */
export function useSpecies() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSpecies = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getSpecies();
      setSpecies(data);
    } catch (error) {
      console.error('Error loading species:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSpecies();
    }, [loadSpecies])
  );

  return {
    species,
    refreshing,
    loadSpecies,
    /**
     * Cria uma nova espécie.
     * @param speciesData Dados da espécie (sem ID).
     * @returns A espécie criada.
     */
    createSpecies: async (speciesData: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newSpecies = await createSpecies(speciesData);
        setSpecies((prev) => [...prev, newSpecies]);
        return newSpecies;
      } catch (error) {
        console.error('Error creating species:', error);
        throw error;
      }
    },
    /**
     * Atualiza uma espécie existente.
     * @param updatedSpecies Dados atualizados da espécie.
     * @returns A espécie atualizada.
     */
    updateSpecies: async (updatedSpecies: Species) => {
      try {
        const updated = await updateSpecies(updatedSpecies);
        setSpecies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        return updated;
      } catch (error) {
        console.error('Error updating species:', error);
        throw error;
      }
    },
    /**
     * Deleta uma espécie.
     * @param id ID da espécie a ser deletada.
     */
    deleteSpecies: async (id: string) => {
      try {
        await deleteSpecies(id);
        setSpecies((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Error deleting species:', error);
        throw error;
      }
    },
  };
}