export interface ParticipantRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  organisation: string | null;
}

export interface Participant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  organisation: string | null;
  actif: boolean;
  dateCreation: string;
}