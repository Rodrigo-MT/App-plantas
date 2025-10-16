import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { createSpecies, deleteSpecies, getSpecies, updateSpecies, canRemoveSpecies } from '../services/species.service';
import { Species } from '../types/species';

/**
 * Hook para gerenciar espécies.
 * @returns Objeto com espécies, estado de loading/error e funções para manipular espécies.
 */
export function useSpecies() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSpecies = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getSpecies();
      setSpecies(data);
    } catch (error) {
      console.error('Error loading species:', error);
      setError('Erro ao carregar espécies');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSpecies();
    }, [loadSpecies])
  );

  /**
   * Limpa todas as espécies personalizadas (que não têm plantas associadas)
   */
  const clearCustomSpecies = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌱 Iniciando limpeza de espécies personalizadas...');
      
      // Busca todas as espécies
      const allSpecies = await getSpecies();
      console.log(`📊 Total de espécies encontradas: ${allSpecies.length}`);
      
      // Filtra as espécies que podem ser deletadas (não têm plantas associadas)
      const deletableSpecies = [];
      
      for (const speciesItem of allSpecies) {
        try {
          const canRemove = await canRemoveSpecies(speciesItem.id);
          if (canRemove.canBeRemoved) {
            deletableSpecies.push(speciesItem);
            console.log(`✅ Espécie "${speciesItem.name}" pode ser removida`);
          } else {
            console.log(`❌ Espécie "${speciesItem.name}" NÃO pode ser removida (${canRemove.plantCount} plantas associadas)`);
          }
        } catch (error) {
          console.error(`Erro ao verificar espécie ${speciesItem.name}:`, error);
        }
      }
      
      console.log(`🗑️ Espécies a serem removidas: ${deletableSpecies.length}`);
      
      // Deleta as espécies que podem ser removidas
      let deletedCount = 0;
      for (const speciesItem of deletableSpecies) {
        try {
          await deleteSpecies(speciesItem.id);
          deletedCount++;
          console.log(`✅ Espécie "${speciesItem.name}" removida com sucesso`);
        } catch (error) {
          console.error(`❌ Erro ao remover espécie "${speciesItem.name}":`, error);
        }
      }
      
      // Recarrega a lista
      await loadSpecies();
      
      console.log(`🎉 Limpeza concluída: ${deletedCount} espécies removidas`);
      
    } catch (error) {
      console.error('Error clearing custom species:', error);
      setError('Erro ao limpar espécies personalizadas');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    species,
    refreshing,
    loading,
    error,
    loadSpecies,
    /**
     * Cria uma nova espécie.
     * @param speciesData Dados da espécie (sem ID).
     * @returns A espécie criada.
     */
    createSpecies: async (speciesData: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setLoading(true);
        setError(null);
        const newSpecies = await createSpecies(speciesData);
        setSpecies((prev) => [...prev, newSpecies]);
        return newSpecies;
      } catch (error) {
        console.error('Error creating species:', error);
        setError('Erro ao criar espécie');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Atualiza uma espécie existente.
     * @param updatedSpecies Dados atualizados da espécie.
     * @returns A espécie atualizada.
     */
    updateSpecies: async (updatedSpecies: Species) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await updateSpecies(updatedSpecies);
        setSpecies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        return updated;
      } catch (error) {
        console.error('Error updating species:', error);
        setError('Erro ao atualizar espécie');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Deleta uma espécie.
     * @param id ID da espécie a ser deletada.
     */
    deleteSpecies: async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await deleteSpecies(id);
        setSpecies((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Error deleting species:', error);
        setError('Erro ao deletar espécie');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Verifica se uma espécie pode ser removida
     * @param id ID da espécie
     * @returns Objeto com informação se pode ser removida
     */
    canRemoveSpecies: async (id: string): Promise<{ canBeRemoved: boolean; plantCount: number }> => {
      try {
        return await canRemoveSpecies(id);
      } catch (error) {
        console.error('Error checking if species can be removed:', error);
        throw error;
      }
    },
    /**
     * Limpa todas as espécies personalizadas (que não têm plantas associadas)
     */
    clearCustomSpecies,
    /**
     * Limpa o estado de erro
     */
    clearError: () => setError(null),
  };
}