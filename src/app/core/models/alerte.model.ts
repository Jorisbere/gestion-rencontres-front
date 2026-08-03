export type TypeAlerte = 'CONFLIT_SALLE' | 'RENCONTRE_PROCHE' | 'COURRIER_RETARD';

export type NiveauAlerte = 'INFO' | 'ATTENTION' | 'CRITIQUE';

export type StatutEnvoi = 'EN_ATTENTE' | 'ENVOYEE' | 'ECHEC';

export interface Alerte {
  id: number;
  type: TypeAlerte;
  niveau: NiveauAlerte;
  rencontreId: number | null;
  rencontreLibelle: string | null;
  courrierId: number | null;
  courrierLibelle: string | null;
  message: string;
  statutEnvoi: StatutEnvoi;
  traitee: boolean;
  dateCreation: string;
  dateEnvoi: string | null;
  dateTraitement: string | null;
}