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
import { Location } from '../types/location';
import { handleApiError } from '../utils/handleApiError';

/**
 * Hook para gerenciar locais.
 */
export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 🔹 Carrega todos os locais */
  const loadLocations = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getLocations();
      setLocations(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar locais:', err);
      setError(handleApiError(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  /** 🔹 Carrega locais por tipo */
  const loadLocationsByType = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocationsByType(type);
      setLocations(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar locais por tipo:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Carrega locais por nível de luz solar */
  const loadLocationsBySunlight = useCallback(async (sunlight: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocationsBySunlight(sunlight);
      setLocations(data);
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar locais por nível de luz:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔹 Recarrega automaticamente ao focar na tela */
  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [loadLocations])
  );

  /** 🔹 Cria um novo local */
  const createLocationItem = async (
    locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Location> => {
    try {
      setLoading(true);
      setError(null);
      const newLocation = await createLocation(locationData);
      setLocations((prev) => [...prev, newLocation]);
      return newLocation;
    } catch (err: unknown) {
      console.error('❌ Erro ao criar local:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Atualiza um local existente */
  const updateLocationItem = async (updatedLocation: Location): Promise<Location> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateLocation(updatedLocation);
      setLocations((prev) =>
        prev.map((loc) => (loc.id === updated.id ? updated : loc))
      );
      return updated;
    } catch (err: unknown) {
      console.error('❌ Erro ao atualizar local:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Deleta um local */
  const deleteLocation = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteLocationService(id);
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err: unknown) {
      console.error('❌ Erro ao deletar local:', err);
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Verifica se um local pode ser removido (sem plantas associadas) */
  const checkCanRemove = async (id: string): Promise<{ isEmpty: boolean }> => {
    try {
      return await canRemoveLocation(id);
    } catch (err: unknown) {
      console.error('❌ Erro ao verificar remoção de local:', err);
      setError(handleApiError(err));
      throw err;
    }
  };

  /** 🔹 Remove todos os locais vazios */
  const clearEmptyLocations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let deletedCount = 0;
      let skippedCount = 0;

      for (const location of locations) {
        try {
          const { isEmpty } = await checkCanRemove(location.id);
          if (isEmpty) {
            await deleteLocation(location.id);
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
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Limpa o erro atual */
  const clearError = () => setError(null);

  return {
    locations,
    refreshing,
    loading,
    error,
    loadLocations,
    loadLocationsByType,
    loadLocationsBySunlight,
    createLocation: createLocationItem,
    updateLocation: updateLocationItem,
    deleteLocation,
    canRemoveLocation: checkCanRemove,
    clearEmptyLocations,
    clearError,
  };
}
