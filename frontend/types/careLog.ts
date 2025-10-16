export interface CareLog {
  id: string;
  plantId: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'cleaning' | 'other';
  date: Date;
  notes?: string;
  photo?: string;
  success: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}