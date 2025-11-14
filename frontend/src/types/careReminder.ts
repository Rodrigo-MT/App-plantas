// src/types/careReminder.ts
export interface CareReminder {
  id: string;
  plantName: string; // ✅ MUDOU: plantId → plantName
  type: 'watering' | 'fertilizing' | 'pruning' | 'sunlight' | 'other';
  frequency: number;
  lastDone: Date;
  nextDue: Date;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Campos opcionais que podem vir do backend com relações
  plant?: any; // Para compatibilidade com dados relacionados
  // Compatibilidade: alguns componentes esperam plantId
  plantId?: string;
}

// Types para criação e atualização
export type CreateCareReminderData = Omit<CareReminder, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCareReminderData = Partial<CreateCareReminderData>;