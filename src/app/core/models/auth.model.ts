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
  role: 'ADMINISTRATEUR' | 'ORGANISATEUR' | 'SECRETARIAT';
  expiration: string;
}

export interface UtilisateurConnecte {
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMINISTRATEUR' | 'ORGANISATEUR' | 'SECRETARIAT';
}