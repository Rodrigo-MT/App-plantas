export interface Species {
  id: string;
  name: string; // obrigatório
  commonName: string; // obrigatório no backend, pode atualizar para não opcional
  description: string; // obrigatório
  careInstructions: string; // obrigatório
  idealConditions: string; // obrigatório
  photo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
