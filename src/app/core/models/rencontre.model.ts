/**
 * Texte libre côté back (V7) : ces 4 valeurs restent proposées comme suggestions dans les
 * formulaires, mais n'importe quel autre type peut être saisi.
 */
export type TypeRencontre = string;
export const TYPES_RENCONTRE_SUGGERES: readonly string[] = ['FORMATION', 'REUNION', 'SEMINAIRE', 'ATELIER'];

export type StatutRencontre = 'PLANIFIEE' | 'CONFIRMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface RencontreRequest {
  titre: string;
  typeRencontre: TypeRencontre;
  dateDebut: string;
  dateFin: string;
  salleId: number;
  capacitePrevue: number;
  /** Facultatif : Agent demandeur si différent de l'organisateur connecté. */
  initiateurId: number | null;
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
  capacitePrevue: number;
  organisateurId: number;
  organisateurNomComplet: string;
  initiateurId: number;
  initiateurNomComplet: string;
  description: string | null;
  dateCreation: string;
  dateModification: string;
}
