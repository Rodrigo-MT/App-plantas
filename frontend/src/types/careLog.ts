// src/types/careLog.ts
export interface CareLog {
  id: string;
  plantName: string; // ✅ MUDOU: plantId → plantName
  type: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'cleaning' | 'other';
  date: Date;
  notes?: string;
  success: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Campos opcionais que podem vir do backend com relações
  plant?: any; // Para compatibilidade com dados relacionados
  // Compatibilidade: alguns componentes esperam plantId
  plantId?: string;
}

// Types para criação e atualização
export type CreateCareLogData = Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCareLogData = Partial<CreateCareLogData>;