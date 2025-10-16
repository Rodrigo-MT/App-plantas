import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { 
  createLocation, 
  deleteLocation as deleteLocationService, 
  getLocations, 
  updateLocation, 
  canRemoveLocation,
  getLocationsByType,
  getLocationsBySunlight 
} from '../services/locations.service';
import { Location } from '../types/location';

/**
 * Hook para gerenciar locais.
 * @returns Objeto com locais, estado de loading/error e funções para manipular locais.
 */
export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
      setError('Erro ao carregar locais');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadLocationsByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocationsByType(type);
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations by type:', error);
      setError('Erro ao carregar locais por tipo');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLocationsBySunlight = useCallback(async (sunlight: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocationsBySunlight(sunlight);
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations by sunlight:', error);
      setError('Erro ao carregar locais por nível de luz');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [loadLocations])
  );

  /**
   * Deleta um local.
   * @param id ID do local a ser deletado.
   */
  const deleteLocation = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteLocationService(id);
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (error) {
      console.error('Error deleting location:', error);
      setError('Erro ao deletar local');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpa locais que não têm plantas associadas
   */
  const clearEmptyLocations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📍 Verificando locais vazios...');
      
      let deletedCount = 0;
      let skippedCount = 0;
      
      for (const location of locations) {
        try {
          // Verifica se o local está vazio
          const isEmpty = await canRemoveLocation(location.id);
          if (isEmpty.isEmpty) {
            await deleteLocation(location.id);
            deletedCount++;
            console.log(`✅ Local "${location.name}" removido`);
          } else {
            skippedCount++;
            console.log(`❌ Local "${location.name}" não pode ser removido (tem plantas)`);
          }
        } catch (error) {
          console.error(`Erro ao verificar local ${location.name}:`, error);
          skippedCount++;
        }
      }
      
      // Recarrega a lista
      await loadLocations();
      
      console.log(`🎉 ${deletedCount} locais vazios removidos, ${skippedCount} locais com plantas mantidos`);
      
    } catch (error) {
      console.error('Error clearing empty locations:', error);
      setError('Erro ao limpar locais vazios');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    locations,
    refreshing,
    loading,
    error,
    loadLocations,
    loadLocationsByType,
    loadLocationsBySunlight,
    /**
     * Cria um novo local.
     * @param locationData Dados do local (sem ID).
     * @returns O local criado.
     */
    createLocation: async (locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setLoading(true);
        setError(null);
        const newLocation = await createLocation(locationData);
        setLocations((prev) => [...prev, newLocation]);
        return newLocation;
      } catch (error) {
        console.error('Error creating location:', error);
        setError('Erro ao criar local');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Atualiza um local existente.
     * @param updatedLocation Dados atualizados do local.
     * @returns O local atualizado.
     */
    updateLocation: async (updatedLocation: Location) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await updateLocation(updatedLocation);
        setLocations((prev) => prev.map((loc) => (loc.id === updated.id ? updated : loc)));
        return updated;
      } catch (error) {
        console.error('Error updating location:', error);
        setError('Erro ao atualizar local');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    /**
     * Deleta um local.
     * @param id ID do local a ser deletado.
     */
    deleteLocation,
    /**
     * Verifica se um local pode ser removido
     * @param id ID do local
     * @returns Objeto com informação se pode ser removido
     */
    canRemoveLocation: async (id: string): Promise<{ isEmpty: boolean }> => {
      try {
        return await canRemoveLocation(id);
      } catch (error) {
        console.error('Error checking if location can be removed:', error);
        throw error;
      }
    },
    /**
     * Limpa locais que não têm plantas associadas
     */
    clearEmptyLocations,
    /**
     * Limpa o estado de erro
     */
    clearError: () => setError(null),
  };
}