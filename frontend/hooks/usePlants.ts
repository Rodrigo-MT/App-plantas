import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { 
  createPlant, 
  deletePlant, 
  getPlants, 
  updatePlant, 
  getPlantsByLocation,
  getPlantsBySpecies 
} from '../services/plants.service';
import { Plant } from '../types/plant';

/**
 * Hook para gerenciar plantas.
 * @returns Objeto com plantas, estado de refreshing e funções para manipular plantas.
 */
export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlants = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getPlants();
      setPlants(data);
    } catch (error) {
      console.error('Error loading plants:', error);
      setError('Erro ao carregar plantas');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadPlantsByLocation = useCallback(async (locationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlantsByLocation(locationId);
      setPlants(data);
    } catch (error) {
      console.error('Error loading plants by location:', error);
      setError('Erro ao carregar plantas por localização');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPlantsBySpecies = useCallback(async (speciesId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlantsBySpecies(speciesId);
      setPlants(data);
    } catch (error) {
      console.error('Error loading plants by species:', error);
      setError('Erro ao carregar plantas por espécie');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlants();
    }, [loadPlants])
  );

  return {
    plants,
    refreshing,
    loading,
    error,
    loadPlants,
    loadPlantsByLocation,
    loadPlantsBySpecies,
    /**
     * Cria uma nova planta.
     * @param plantData Dados da planta (sem ID).
     * @returns A planta criada.
     */
    createPlant: async (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setError(null);
        const newPlant = await createPlant(plantData);
        setPlants((prev) => [...prev, newPlant]);
        return newPlant;
      } catch (error) {
        console.error('Error creating plant:', error);
        setError('Erro ao criar planta');
        throw error;
      }
    },
    /**
     * Atualiza uma planta existente.
     * @param updatedPlant Dados atualizados da planta.
     * @returns A planta atualizada.
     */
    updatePlant: async (updatedPlant: Plant) => {
      try {
        setError(null);
        const updated = await updatePlant(updatedPlant);
        setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        return updated;
      } catch (error) {
        console.error('Error updating plant:', error);
        setError('Erro ao atualizar planta');
        throw error;
      }
    },
    /**
     * Deleta uma planta.
     * @param id ID da planta a ser deletada.
     */
    deletePlant: async (id: string) => {
      try {
        setError(null);
        await deletePlant(id);
        setPlants((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Error deleting plant:', error);
        setError('Erro ao deletar planta');
        throw error;
      }
    },
    /**
     * Limpa o estado de erro
     */
    clearError: () => setError(null),
  };
}