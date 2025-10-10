import { useEffect, useState } from 'react';
import { createSpecies, deleteSpecies, getSpecies, updateSpecies } from '../services/species.service';
import { Species } from '../types/species';

export function useSpecies() {
  const [species, setSpecies] = useState<Species[]>([]);

  useEffect(() => {
    async function fetchSpecies() {
      const data = await getSpecies();
      setSpecies(data);
    }
    fetchSpecies();
  }, []);

  return {
    species,
    createSpecies: async (newSpeciesData: Omit<Species, 'id'>) => {
      const newSpecies = await createSpecies(newSpeciesData);
      setSpecies([...species, newSpecies]);
      return newSpecies;
    },
    updateSpecies: async (updatedSpecies: Species) => {
      const updated = await updateSpecies(updatedSpecies);
      setSpecies(species.map((s: Species) => (s.id === updatedSpecies.id ? updated : s)));
      return updated;
    },
    deleteSpecies: async (id: string) => {
      await deleteSpecies(id);
      setSpecies(species.filter((s: Species) => s.id !== id));
    },
  };
}