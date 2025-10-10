import { useEffect, useState } from 'react';
import { createPlant, deletePlant, getPlants, updatePlant } from '../services/plants.service';
import { Plant } from '../types/plant';

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    async function fetchPlants() {
      const data = await getPlants();
      setPlants(data);
    }
    fetchPlants();
  }, []);

  return {
    plants,
    createPlant: async (plant: Omit<Plant, 'id'>) => {
      const newPlant = await createPlant(plant);
      setPlants([...plants, newPlant]);
      return newPlant;
    },
    updatePlant: async (plant: Plant) => {
      const updated = await updatePlant(plant);
      setPlants(plants.map((p) => (p.id === plant.id ? updated : p)));
      return updated;
    },
    deletePlant: async (id: string) => {
      await deletePlant(id);
      setPlants(plants.filter((p) => p.id !== id));
    },
  };
}