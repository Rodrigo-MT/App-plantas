// src/hooks/useLocations.ts
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  createLocation,
  deleteLocation as deleteLocationService,
  getLocations,
  updateLocation,
  canRemoveLocation,
  getLocationsByType,
  getLocationsBySunlight,
} from '../services/locations.service';
import { Location, CreateLocationData, UpdateLocationData } from '../types/location';
import { handleApiError } from '../utils/handleApiError';

/**
 * Hook para gerenciar locais.
 */
export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- LOAD ALL ----------
  const loadLocations = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getLocations();
      setLocations(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar locais:', err);
      setError(handleApiError(err, 'Erro ao carregar localizações'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ---------- LOAD BY TYPE ----------
  const loadLocationsByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocationsByType(type);
      setLocations(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar locais por tipo:', err);
      setError(handleApiError(err, 'Erro ao carregar localizações por tipo'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- LOAD BY SUNLIGHT ----------
  const loadLocationsBySunlight = useCallback(async (sunlight: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocationsBySunlight(sunlight);
      setLocations(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar locais por nível de luz:', err);
      setError(handleApiError(err, 'Erro ao carregar localizações por nível de luz'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- CREATE ----------
  const createLocationItem = useCallback(async (
    locationData: CreateLocationData // ✅ Tipo correto
  ): Promise<Location> => {
    try {
      setLoading(true);
      setError(null);
      const newLocation = await createLocation(locationData);
      setLocations((prev) => [...prev, newLocation]);
      return newLocation;
    } catch (err: unknown) {
      console.error('❌ Erro ao criar local:', err);
      const message = handleApiError(err, 'Erro ao criar localização');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- UPDATE ----------
  const updateLocationItem = useCallback(async (
    id: string, 
    locationData: UpdateLocationData // ✅ Assinatura corrigida
  ): Promise<Location> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateLocation(id, locationData); // ✅ Chama com id separado
      setLocations((prev) =>
        prev.map((loc) => (loc.id === updated.id ? updated : loc))
      );
      return updated;
    } catch (err: unknown) {
      console.error('❌ Erro ao atualizar local:', err);
      const message = handleApiError(err, 'Erro ao atualizar localização');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- DELETE ----------
  const deleteLocationItem = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteLocationService(id);
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err: unknown) {
      console.error('❌ Erro ao deletar local:', err);
      const message = handleApiError(err, 'Erro ao excluir localização');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- CHECK CAN REMOVE ----------
  const checkCanRemove = useCallback(async (id: string): Promise<{ isEmpty: boolean }> => {
    try {
      return await canRemoveLocation(id);
    } catch (err: unknown) {
      console.error('❌ Erro ao verificar remoção de local:', err);
      const message = handleApiError(err, 'Erro ao verificar se localização pode ser removida');
      setError(message);
      throw new Error(message);
    }
  }, []);

  // ---------- CLEAR EMPTY LOCATIONS ----------
  const clearEmptyLocations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let deletedCount = 0;
      let skippedCount = 0;

      for (const location of locations) {
        try {
          const { isEmpty } = await checkCanRemove(location.id);
          if (isEmpty) {
            await deleteLocationItem(location.id);
            deletedCount++;
          } else {
            skippedCount++;
          }
        } catch {
          skippedCount++;
        }
      }

      await loadLocations();
      console.log(
        `🧹 ${deletedCount} locais vazios removidos, ${skippedCount} locais mantidos.`
      );
    } catch (err: unknown) {
      console.error('❌ Erro ao limpar locais vazios:', err);
      const message = handleApiError(err, 'Erro ao limpar localizações vazias');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [locations, checkCanRemove, deleteLocationItem, loadLocations]);

  // ---------- UTILITIES ----------
  const findLocationById = useCallback((id: string): Location | undefined => {
    return locations.find(loc => loc.id === id);
  }, [locations]);

  const findLocationByName = useCallback((name: string): Location | undefined => {
    return locations.find(loc => loc.name.toLowerCase() === name.toLowerCase());
  }, [locations]);

  const findLocationsByType = useCallback((type: string): Location[] => {
    return locations.filter(loc => loc.type === type);
  }, [locations]);

  const findLocationsBySunlight = useCallback((sunlight: string): Location[] => {
    return locations.filter(loc => loc.sunlight === sunlight);
  }, [locations]);

  const getLocationNames = useCallback((): string[] => {
    return locations.map(loc => loc.name).filter(Boolean).sort();
  }, [locations]);

  const getLocationOptions = useCallback(() => {
    return locations.map(loc => ({
      label: loc.name,
      value: loc.name, // ✅ Para usar em selects que precisam do nome
    }));
  }, [locations]);

  const getEmptyLocations = useCallback(async (): Promise<Location[]> => {
    const emptyLocations: Location[] = [];
    
    for (const location of locations) {
      try {
        const { isEmpty } = await checkCanRemove(location.id);
        if (isEmpty) {
          emptyLocations.push(location);
        }
      } catch {
        // Ignora erros na verificação
      }
    }
    
    return emptyLocations;
  }, [locations, checkCanRemove]);

  const clearError = useCallback(() => setError(null), []);

  // ---------- AUTO LOAD ----------
  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [loadLocations])
  );

  return {
    // Estado
    locations,
    refreshing,
    loading,
    error,

    // Ações de carregamento
    loadLocations,
    loadLocationsByType,
    loadLocationsBySunlight,

    // Ações CRUD
    createLocation: createLocationItem,
    updateLocation: updateLocationItem,
    deleteLocation: deleteLocationItem,
    canRemoveLocation: checkCanRemove,
    clearEmptyLocations,

    // Utilitários
    findLocationById,
    findLocationByName,
    findLocationsByType,
    findLocationsBySunlight,
    getLocationNames,
    getLocationOptions,
    getEmptyLocations,
    clearError,
  };
}