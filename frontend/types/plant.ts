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
  
  // Campos opcionais que podem vir do backend com relações
  species?: any; // Para compatibilidade com dados relacionados
  location?: any; // Para compatibilidade com dados relacionados
}