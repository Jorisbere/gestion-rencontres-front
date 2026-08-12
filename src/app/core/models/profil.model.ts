export interface ProfilUpdateRequest {
  nom: string;
  prenom: string;
}

export interface PasswordUpdateRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
  confirmation: string;
}