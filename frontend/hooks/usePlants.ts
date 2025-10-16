import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { createPlant, deletePlant, getPlants, updatePlant } from '../services/plants.service';
import { Plant } from '../types/plant';

/**
 * Hook para gerenciar plantas.
 * @returns Objeto com plantas, estado de refreshing e funções para manipular plantas.
 */
export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlants = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getPlants();
      setPlants(data);
    } catch (error) {
      console.error('Error loading plants:', error);
    } finally {
      setRefreshing(false);
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
    loadPlants,
    /**
     * Cria uma nova planta.
     * @param plantData Dados da planta (sem ID).
     * @returns A planta criada.
     */
    createPlant: async (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newPlant = await createPlant(plantData);
        setPlants((prev) => [...prev, newPlant]);
        return newPlant;
      } catch (error) {
        console.error('Error creating plant:', error);
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
        const updated = await updatePlant(updatedPlant);
        setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        return updated;
      } catch (error) {
        console.error('Error updating plant:', error);
        throw error;
      }
    },
    /**
     * Deleta uma planta.
     * @param id ID da planta a ser deletada.
     */
    deletePlant: async (id: string) => {
      try {
        await deletePlant(id);
        setPlants((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Error deleting plant:', error);
        throw error;
      }
    },
  };
}