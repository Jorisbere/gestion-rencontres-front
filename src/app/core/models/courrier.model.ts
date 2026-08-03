export type SensCourrier = 'ENTRANT' | 'SORTANT';

export type StatutCourrier = 'RECU' | 'EN_TRAITEMENT' | 'TRAITE' | 'ARCHIVE';

export interface CourrierRequest {
  sens: SensCourrier;
  objet: string;
  expediteur: string | null;
  destinataire: string | null;
  dateReceptionEnvoi: string | null;
}

export interface Courrier {
  id: number;
  rencontreId: number;
  sens: SensCourrier;
  statut: StatutCourrier;
  reference: string;
  objet: string;
  expediteur: string | null;
  destinataire: string | null;
  dateReceptionEnvoi: string;
  dateCreation: string;
  dateModification: string;
  enRetard: boolean;
}

export interface HistoriqueStatutCourrier {
  id: number;
  courrierId: number;
  ancienStatut: StatutCourrier | null;
  nouveauStatut: StatutCourrier;
  auteur: string;
  dateChangement: string;
}