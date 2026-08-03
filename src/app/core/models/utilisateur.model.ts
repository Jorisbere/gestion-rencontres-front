export type RoleUtilisateur = 'ADMINISTRATEUR' | 'ORGANISATEUR' | 'SECRETARIAT';

export interface UtilisateurRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: RoleUtilisateur;
}

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: RoleUtilisateur;
  actif: boolean;
  dateCreation: string;
}