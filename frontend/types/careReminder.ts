export interface CareReminder {
  id: string;
  plantId: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'sunlight' | 'other';
  frequency: number;
  lastDone: Date;
  nextDue: Date;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
