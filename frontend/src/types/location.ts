// src/types/location.ts
export interface Location {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'balcony' | 'garden' | 'terrace';
  sunlight: 'full' | 'partial' | 'shade';
  humidity: 'low' | 'medium' | 'high';
  description?: string;
  photo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Types para criação e atualização
export type CreateLocationData = Omit<Location, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLocationData = Partial<CreateLocationData>;