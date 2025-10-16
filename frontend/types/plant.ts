export interface Plant {
  id: string;
  name: string;
  speciesId: string;
  locationId: string;
  purchaseDate: Date;
  notes?: string;
  photo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}