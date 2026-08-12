export type RoleUtilisateur = 'ADMINISTRATEUR' | 'ORGANISATEUR' | 'SECRETARIAT' | 'AGENT';

export interface UtilisateurRequest {
  agentId: number;
  motDePasse: string;
  role: RoleUtilisateur;
}

export interface Utilisateur {
  id: number;
  agentId: number;
  nom: string;
  prenom: string;
  email: string;
  role: RoleUtilisateur;
  actif: boolean;
  dateCreation: string;
}
