export interface Species {
  id: string;
  name: string;
  commonName?: string;
  description?: string;
  careInstructions?: string;
  idealConditions?: string;
  photo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
