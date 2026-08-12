import { RoleUtilisateur } from './utilisateur.model';

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  role: RoleUtilisateur;
  expiration: string;
}

export interface UtilisateurConnecte {
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  role: RoleUtilisateur;
}

/** Auto-inscription (cas d'usage "Créer compte" porté par l'acteur Agent). */
export interface RegisterRequest {
  email: string;
  motDePasse: string;
}
