import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { createLocation, deleteLocation, getLocations, updateLocation } from '../services/locations.service';
import { Location } from '../types/location';

/**
 * Hook para gerenciar locais.
 * @returns Objeto com locais, estado de refreshing e funções para manipular locais.
 */
export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLocations = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [loadLocations])
  );

  return {
    locations,
    refreshing,
    loadLocations,
    /**
     * Cria um novo local.
     * @param locationData Dados do local (sem ID).
     * @returns O local criado.
     */
    createLocation: async (locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newLocation = await createLocation(locationData);
        setLocations((prev) => [...prev, newLocation]);
        return newLocation;
      } catch (error) {
        console.error('Error creating location:', error);
        throw error;
      }
    },
    /**
     * Atualiza um local existente.
     * @param updatedLocation Dados atualizados do local.
     * @returns O local atualizado.
     */
    updateLocation: async (updatedLocation: Location) => {
      try {
        const updated = await updateLocation(updatedLocation);
        setLocations((prev) => prev.map((loc) => (loc.id === updated.id ? updated : loc)));
        return updated;
      } catch (error) {
        console.error('Error updating location:', error);
        throw error;
      }
    },
    /**
     * Deleta um local.
     * @param id ID do local a ser deletado.
     */
    deleteLocation: async (id: string) => {
      try {
        await deleteLocation(id);
        setLocations((prev) => prev.filter((loc) => loc.id !== id));
      } catch (error) {
        console.error('Error deleting location:', error);
        throw error;
      }
    },
  };
}