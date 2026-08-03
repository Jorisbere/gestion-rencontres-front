export interface SalleRequest {
  nom: string;
  capacite: number;
  localisation: string | null;
}

export interface Salle {
  id: number;
  nom: string;
  capacite: number;
  localisation: string | null;
  actif: boolean;
  dateCreation: string;
}