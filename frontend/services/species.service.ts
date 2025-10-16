import AsyncStorage from '@react-native-async-storage/async-storage';
import { Species } from '../types/species';

const SPECIES_KEY = '@species';
const defaultSpecies: Species[] = [
  {
    id: '1',
    name: 'Monstera deliciosa',
    commonName: 'Costela de Adão',
    description: 'Planta tropical com folhas grandes e recortadas.',
    careInstructions: 'Luz indireta, rega moderada.',
    idealConditions: 'Sol parcial, umidade média.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Ficus lyrata',
    commonName: 'Figueira-lira',
    description: 'Planta com folhas grandes em forma de lira.',
    careInstructions: 'Luz brilhante, rega quando o solo estiver seco.',
    idealConditions: 'Sol pleno, umidade alta.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Recupera todas as espécies armazenadas ou retorna espécies padrão se não existirem.
 * @returns Lista de espécies.
 */
export async function getSpecies(): Promise<Species[]> {
  try {
    const species = await AsyncStorage.getItem(SPECIES_KEY);
    if (!species) {
      await AsyncStorage.setItem(SPECIES_KEY, JSON.stringify(defaultSpecies));
      return defaultSpecies;
    }
    return JSON.parse(species);
  } catch (error) {
    console.error('Error getting species:', error);
    return defaultSpecies;
  }
}

/**
 * Cria uma nova espécie.
 * @param species Dados da espécie (sem ID, que é gerado automaticamente).
 * @returns A espécie criada.
 * @throws Erro se a criação falhar.
 */
export async function createSpecies(species: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>): Promise<Species> {
  try {
    const speciesList = await getSpecies();
    const newSpecies: Species = {
      ...species,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedSpecies = [...speciesList, newSpecies];
    await AsyncStorage.setItem(SPECIES_KEY, JSON.stringify(updatedSpecies));
    return newSpecies;
  } catch (error) {
    console.error('Error creating species:', error);
    throw error;
  }
}

/**
 * Atualiza uma espécie existente.
 * @param species Dados atualizados da espécie, incluindo ID.
 * @returns A espécie atualizada.
 * @throws Erro se a atualização falhar.
 */
export async function updateSpecies(species: Species): Promise<Species> {
  try {
    const speciesList = await getSpecies();
    const updatedSpecies = speciesList.map((s) => (s.id === species.id ? { ...species, updatedAt: new Date() } : s));
    await AsyncStorage.setItem(SPECIES_KEY, JSON.stringify(updatedSpecies));
    return { ...species, updatedAt: new Date() };
  } catch (error) {
    console.error('Error updating species:', error);
    throw error;
  }
}

/**
 * Deleta uma espécie pelo ID.
 * @param id ID da espécie a ser deletada.
 * @throws Erro se a deleção falhar.
 */
export async function deleteSpecies(id: string): Promise<void> {
  try {
    const speciesList = await getSpecies();
    const updatedSpecies = speciesList.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SPECIES_KEY, JSON.stringify(updatedSpecies));
  } catch (error) {
    console.error('Error deleting species:', error);
    throw error;
  }
}