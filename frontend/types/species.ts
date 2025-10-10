export interface Species {
  id: string;
  name: string; // Scientific name
  commonName?: string; // Common name
  description?: string;
  careInstructions?: string;
  idealConditions?: string;
  photo?: string;
}