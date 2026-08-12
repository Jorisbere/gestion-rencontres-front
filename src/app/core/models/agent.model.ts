export interface AgentRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  fonction: string | null;
}

export interface Agent {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  fonction: string | null;
  actif: boolean;
  possedeUnCompte: boolean;
  dateCreation: string;
}
