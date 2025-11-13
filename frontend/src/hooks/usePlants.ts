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
import { handleApiError } from '../utils/handleApiError';

/**
 * Hook para gerenciar plantas com tratamento de erros do backend.
 */
export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- LOAD ALL ----------
  const loadPlants = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getPlants();
      setPlants(data);
    } catch (err) {
      console.error('Error loading plants:', err);
      setError(handleApiError(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ---------- LOAD BY LOCATION ----------
  const loadPlantsByLocation = useCallback(async (locationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlantsByLocation(locationId);
      setPlants(data);
    } catch (err) {
      console.error('Error loading plants by location:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD BY SPECIES ----------
  const loadPlantsBySpecies = useCallback(async (speciesId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlantsBySpecies(speciesId);
      setPlants(data);
    } catch (err) {
      console.error('Error loading plants by species:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- CREATE ----------
  const createPlantEntry = useCallback(
    async (plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setError(null);
        const newPlant = await createPlant(plantData);
        setPlants((prev) => [...prev, newPlant]);
        return newPlant;
      } catch (err) {
        console.error('Error creating plant:', err);
        const message = handleApiError(err);
        setError(message);
        throw err;
      }
    },
    []
  );

  // ---------- UPDATE ----------
  const updatePlantEntry = useCallback(async (updatedPlant: Plant) => {
    try {
      setError(null);
      const updated = await updatePlant(updatedPlant);
      setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    } catch (err) {
      console.error('Error updating plant:', err);
      const message = handleApiError(err);
      setError(message);
      throw err;
    }
  }, []);

  // ---------- DELETE ----------
  const deletePlantEntry = useCallback(async (id: string) => {
    try {
      setError(null);
      await deletePlant(id);
      setPlants((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting plant:', err);
      const message = handleApiError(err);
      setError(message);
      throw err;
    }
  }, []);

  // ---------- CLEAR ERROR ----------
  const clearError = useCallback(() => setError(null), []);

  // ---------- AUTO LOAD ----------
  useFocusEffect(
    useCallback(() => {
      loadPlants();
    }, [loadPlants])
  );

  // ---------- RETURN ----------
  return {
    plants,
    refreshing,
    loading,
    error,
    loadPlants,
    loadPlantsByLocation,
    loadPlantsBySpecies,
    createPlant: createPlantEntry,
    updatePlant: updatePlantEntry,
    deletePlant: deletePlantEntry,
    clearError,
  };
}
