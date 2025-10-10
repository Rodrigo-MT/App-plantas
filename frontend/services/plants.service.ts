import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Plant } from '../types/plant';

const PLANTS_KEY = '@plants';

export async function getPlants(): Promise<Plant[]> {
  const plants = await AsyncStorage.getItem(PLANTS_KEY);
  return plants ? JSON.parse(plants) : [];
}

export async function createPlant(plant: Omit<Plant, 'id'>): Promise<Plant> {
  const newPlant = { ...plant, id: uuidv4() };
  const plants = await getPlants();
  const updatedPlants = [...plants, newPlant];
  await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(updatedPlants));
  return newPlant;
}

export async function updatePlant(plant: Plant): Promise<Plant> {
  const plants = await getPlants();
  const updatedPlants = plants.map((p) => (p.id === plant.id ? plant : p));
  await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(updatedPlants));
  return plant;
}

export async function deletePlant(id: string): Promise<void> {
  const plants = await getPlants();
  const updatedPlants = plants.filter((p) => p.id !== id);
  await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(updatedPlants));
}