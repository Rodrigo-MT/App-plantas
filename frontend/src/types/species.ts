// src/types/species.ts
export interface Species {
  id: string;
  name: string;
  commonName?: string; // ✅ OPCIONAL (conforme DTO)
  description?: string; // ✅ OPCIONAL (conforme DTO)
  careInstructions?: string; // ✅ OPCIONAL (conforme DTO)
  idealConditions?: string; // ✅ OPCIONAL (conforme DTO)
  photo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Types para criação e atualização
export type CreateSpeciesData = Omit<Species, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSpeciesData = Partial<CreateSpeciesData>;