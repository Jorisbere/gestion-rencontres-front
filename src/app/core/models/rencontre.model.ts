export type TypeRencontre = 'FORMATION' | 'REUNION' | 'SEMINAIRE' | 'ATELIER';

export type StatutRencontre = 'PLANIFIEE' | 'CONFIRMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface RencontreRequest {
  titre: string;
  typeRencontre: TypeRencontre;
  dateDebut: string;
  dateFin: string;
  salleId: number;
  description: string | null;
}

export interface Rencontre {
  id: number;
  titre: string;
  typeRencontre: TypeRencontre;
  statut: StatutRencontre;
  dateDebut: string;
  dateFin: string;
  salleId: number;
  salleNom: string;
  organisateurId: number;
  organisateurNomComplet: string;
  description: string | null;
  dateCreation: string;
  dateModification: string;
}