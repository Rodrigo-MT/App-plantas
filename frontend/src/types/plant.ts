// src/types/plant.ts
export interface Plant {
  id: string;
  name: string;
  speciesName: string; // MUDOU: era speciesId
  locationName: string; // MUDOU: era locationId
  purchaseDate: Date;
  notes?: string;
  photo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Campos opcionais para compatibilidade
  species?: any;
  location?: any;
  // IDs opcionais para compatibilidade com código mais antigo
  speciesId?: string;
  locationId?: string;
}

// Types para criação e atualização
export type CreatePlantData = Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePlantData = Partial<CreatePlantData>;