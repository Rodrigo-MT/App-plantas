import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plant } from '../types/plant';

const PLANTS_KEY = '@plants';

/**
 * Recupera todas as plantas armazenadas.
 * @returns Lista de plantas ou array vazio em caso de erro.
 */
export async function getPlants(): Promise<Plant[]> {
  try {
    const plants = await AsyncStorage.getItem(PLANTS_KEY);
    return plants ? JSON.parse(plants) : [];
  } catch (error) {
    console.error('Error getting plants:', error);
    return [];
  }
}

/**
 * Cria uma nova planta.
 * @param plant Dados da planta (sem ID, que é gerado automaticamente).
 * @returns A planta criada.
 * @throws Erro se a criação falhar.
 */
export async function createPlant(plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plant> {
  try {
    const plants = await getPlants();
    const newPlant: Plant = {
      ...plant,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedPlants = [...plants, newPlant];
    await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(updatedPlants));
    return newPlant;
  } catch (error) {
    console.error('Error creating plant:', error);
    throw error;
  }
}

/**
 * Atualiza uma planta existente.
 * @param plant Dados atualizados da planta, incluindo ID.
 * @returns A planta atualizada.
 * @throws Erro se a atualização falhar.
 */
export async function updatePlant(plant: Plant): Promise<Plant> {
  try {
    const plants = await getPlants();
    const updatedPlants = plants.map((p) => (p.id === plant.id ? { ...plant, updatedAt: new Date() } : p));
    await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(updatedPlants));
    return { ...plant, updatedAt: new Date() };
  } catch (error) {
    console.error('Error updating plant:', error);
    throw error;
  }
}

/**
 * Deleta uma planta pelo ID.
 * @param id ID da planta a ser deletada.
 * @throws Erro se a deleção falhar.
 */
export async function deletePlant(id: string): Promise<void> {
  try {
    const plants = await getPlants();
    const updatedPlants = plants.filter((p) => p.id !== id);
    await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(updatedPlants));
  } catch (error) {
    console.error('Error deleting plant:', error);
    throw error;
  }
}