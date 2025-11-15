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
import { Plant, CreatePlantData, UpdatePlantData } from '../types/plant';
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
      setError(handleApiError(err, 'Erro ao carregar plantas'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ---------- LOAD BY LOCATION ----------
  const loadPlantsByLocation = useCallback(async (locationName: string) => { // MUDOU: locationId → locationName
    try {
      setLoading(true);
      setError(null);
      const data = await getPlantsByLocation(locationName);
      setPlants(data);
    } catch (err) {
      console.error('Error loading plants by location:', err);
      setError(handleApiError(err, 'Erro ao carregar plantas por localização'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD BY SPECIES ----------
  const loadPlantsBySpecies = useCallback(async (speciesName: string) => { // MUDOU: speciesId → speciesName
    try {
      setLoading(true);
      setError(null);
      const data = await getPlantsBySpecies(speciesName);
      setPlants(data);
    } catch (err) {
      console.error('Error loading plants by species:', err);
      setError(handleApiError(err, 'Erro ao carregar plantas por espécie'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- CREATE ----------
  const createPlantEntry = useCallback(
    async (plantData: CreatePlantData) => { // MUDOU: tipo mais específico
      try {
        setError(null);
        const newPlant = await createPlant(plantData);
        setPlants((prev) => [...prev, newPlant]);
        return newPlant;
      } catch (err) {
        console.error('Error creating plant:', err);
        const message = handleApiError(err, 'Erro ao criar planta');
        setError(message);
        throw new Error(message); // MUDOU: throw error consistente
      }
    },
    []
  );

  // ---------- UPDATE ----------
  const updatePlantEntry = useCallback(async (id: string, plantData: UpdatePlantData) => { // MUDOU: assinatura
    try {
      setError(null);
      const updated = await updatePlant(id, plantData);
      setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    } catch (err) {
      console.error('Error updating plant:', err);
      const message = handleApiError(err, 'Erro ao atualizar planta');
      setError(message);
      throw new Error(message);
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
      const message = handleApiError(err, 'Erro ao excluir planta');
      setError(message);
      throw new Error(message);
    }
  }, []);

  // ---------- FIND PLANT BY ID ----------
  const findPlantById = useCallback((id: string): Plant | undefined => {
    return plants.find(plant => plant.id === id);
  }, [plants]);

  // ---------- FILTER PLANTS ----------
  const filterPlants = useCallback((searchText: string): Plant[] => {
    if (!searchText.trim()) return plants;
    
    const normalizedSearch = searchText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return plants.filter(plant => 
      plant.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch) ||
      plant.speciesName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch) ||
      plant.locationName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch)
    );
  }, [plants]);

  // ---------- GET UNIQUE LOCATIONS ----------
  const getUniqueLocations = useCallback((): string[] => {
    const locations = plants.map(plant => plant.locationName).filter(Boolean);
    return Array.from(new Set(locations)).sort();
  }, [plants]);

  // ---------- GET UNIQUE SPECIES ----------
  const getUniqueSpecies = useCallback((): string[] => {
    const species = plants.map(plant => plant.speciesName).filter(Boolean);
    return Array.from(new Set(species)).sort();
  }, [plants]);

  // ---------- CLEAR ERROR ----------
  const clearError = useCallback(() => setError(null), []);

  // ---------- CLEAR PLANTS ----------
  const clearPlants = useCallback(() => setPlants([]), []);

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
    
    // Ações principais
    loadPlants,
    loadPlantsByLocation,
    loadPlantsBySpecies,
    createPlant: createPlantEntry,
    updatePlant: updatePlantEntry,
    deletePlant: deletePlantEntry,
    
    // Utilitários
    findPlantById,
    filterPlants,
    getUniqueLocations,
    getUniqueSpecies,
    clearError,
    clearPlants,
  };
}