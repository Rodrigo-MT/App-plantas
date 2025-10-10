import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Species } from '../types/species';

const SPECIES_KEY = '@species';

const defaultSpecies: Species[] = [
  {
    id: uuidv4(),
    name: 'Monstera deliciosa',
    commonName: 'Costela-de-Adão',
    description: 'Planta tropical com folhas grandes e recortadas.',
    careInstructions: 'Luz indireta, rega moderada.',
    idealConditions: 'Temperatura quente, solo bem drenado.',
  },
  {
    id: uuidv4(),
    name: 'Ficus lyrata',
    commonName: 'Figueira-lira',
    description: 'Planta com folhas grandes em forma de lira.',
    careInstructions: 'Luz brilhante indireta, rega quando o solo estiver seco.',
    idealConditions: 'Ambiente úmido, evitar correntes de ar.',
  },
  {
    id: uuidv4(),
    name: 'Rosa spp.',
    commonName: 'Rosa',
    description: 'Flor com pétalas coloridas, ideal para jardins.',
    careInstructions: 'Sol pleno, rega regular.',
    idealConditions: 'Solo rico em nutrientes, boa drenagem.',
  },
  {
    id: uuidv4(),
    name: 'Aloe vera',
    commonName: 'Babosa',
    description: 'Suculenta com propriedades medicinais.',
    careInstructions: 'Sol direto, rega esparsa.',
    idealConditions: 'Solo arenoso, pouca água.',
  },
  {
    id: uuidv4(),
    name: 'Lavandula angustifolia',
    commonName: 'Lavanda',
    description: 'Planta aromática com flores roxas.',
    careInstructions: 'Sol pleno, rega moderada.',
    idealConditions: 'Solo bem drenado, clima seco.',
  },
];

export async function getSpecies(): Promise<Species[]> {
  const species = await AsyncStorage.getItem(SPECIES_KEY);
  if (!species) {
    await AsyncStorage.setItem(SPECIES_KEY, JSON.stringify(defaultSpecies));
    return defaultSpecies;
  }
  return JSON.parse(species);
}

export async function createSpecies(species: Omit<Species, 'id'>): Promise<Species> {
  const speciesList = await getSpecies();
  const exists = speciesList.some(
    (s) => s.name.toLowerCase() === species.name.toLowerCase() &&
           (s.commonName?.toLowerCase() === species.commonName?.toLowerCase() || (!s.commonName && !species.commonName))
  );
  if (exists) {
    throw new Error('Espécie com este nome científico e comum já existe.');
  }
  const newSpecies = { ...species, id: uuidv4() };
  const updatedSpecies = [...speciesList, newSpecies];
  await AsyncStorage.setItem(SPECIES_KEY, JSON.stringify(updatedSpecies));
  return newSpecies;
}

export async function updateSpecies(species: Species): Promise<Species> {
  const speciesList = await getSpecies();
  const exists = speciesList.some(
    (s) => s.id !== species.id &&
           s.name.toLowerCase() === species.name.toLowerCase() &&
           (s.commonName?.toLowerCase() === species.commonName?.toLowerCase() || (!s.commonName && !species.commonName))
  );
  if (exists) {
    throw new Error('Espécie com este nome científico e comum já existe.');
  }
  const updatedSpecies = speciesList.map((s) => (s.id === species.id ? species : s));
  await AsyncStorage.setItem(SPECIES_KEY, JSON.stringify(updatedSpecies));
  return species;
}

export async function deleteSpecies(id: string): Promise<void> {
  const speciesList = await getSpecies();
  const updatedSpecies = speciesList.filter((s) => s.id !== id);
  await AsyncStorage.setItem(SPECIES_KEY, JSON.stringify(updatedSpecies));
}