export interface Location {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'balcony' | 'garden' | 'terrace';
  sunlight: 'full' | 'partial' | 'shade';
  humidity: 'low' | 'medium' | 'high';
  description?: string;
  photo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}