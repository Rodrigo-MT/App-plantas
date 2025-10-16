import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location } from '../types/location';

const LOCATIONS_KEY = '@locations';
const defaultLocations: Location[] = [
  {
    id: '1',
    name: 'Sala de Estar',
    type: 'indoor',
    sunlight: 'partial',
    humidity: 'medium',
    description: 'Ambiente interno com luz indireta',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Jardim',
    type: 'garden',
    sunlight: 'full',
    humidity: 'high',
    description: 'Área externa com sol direto',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Recupera todos os locais armazenados ou retorna locais padrão se não existirem.
 * @returns Lista de locais.
 */
export async function getLocations(): Promise<Location[]> {
  try {
    const locations = await AsyncStorage.getItem(LOCATIONS_KEY);
    if (!locations) {
      await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(defaultLocations));
      return defaultLocations;
    }
    return JSON.parse(locations);
  } catch (error) {
    console.error('Error getting locations:', error);
    return defaultLocations;
  }
}

/**
 * Cria um novo local.
 * @param location Dados do local (sem ID, que é gerado automaticamente).
 * @returns O local criado.
 * @throws Erro se a criação falhar.
 */
export async function createLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
  try {
    const locations = await getLocations();
    const newLocation: Location = {
      ...location,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedLocations = [...locations, newLocation];
    await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(updatedLocations));
    return newLocation;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
}

/**
 * Atualiza um local existente.
 * @param location Dados atualizados do local, incluindo ID.
 * @returns O local atualizado.
 * @throws Erro se a atualização falhar.
 */
export async function updateLocation(location: Location): Promise<Location> {
  try {
    const locations = await getLocations();
    const updatedLocations = locations.map((l) => (l.id === location.id ? { ...location, updatedAt: new Date() } : l));
    await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(updatedLocations));
    return { ...location, updatedAt: new Date() };
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
}

/**
 * Deleta um local pelo ID.
 * @param id ID do local a ser deletado.
 * @throws Erro se a deleção falhar.
 */
export async function deleteLocation(id: string): Promise<void> {
  try {
    const locations = await getLocations();
    const updatedLocations = locations.filter((l) => l.id !== id);
    await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(updatedLocations));
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
}