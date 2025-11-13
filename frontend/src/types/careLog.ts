export interface CareLog {
  id: string;
  plantId: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'cleaning' | 'other';
  date: Date;
  notes?: string;
  success: boolean;
  createdAt?: string;
  updatedAt?: string;
}
