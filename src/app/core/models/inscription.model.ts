export type StatutPresence = 'INSCRIT' | 'CONFIRME' | 'PRESENT' | 'ABSENT' | 'ANNULE';

export interface Inscription {
  id: number;
  rencontreId: number;
  participantId: number;
  participantNomComplet: string;
  participantEmail: string;
  statutPresence: StatutPresence;
  dateInscription: string;
  dateConfirmation: string | null;
}