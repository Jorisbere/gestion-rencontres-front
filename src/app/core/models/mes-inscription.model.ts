import { StatutRencontre, TypeRencontre } from './rencontre.model';
import { StatutPresence } from './inscription.model';

export interface MesInscription {
  inscriptionId: number;
  rencontreId: number;
  rencontreTitre: string;
  rencontreType: TypeRencontre;
  rencontreStatut: StatutRencontre;
  dateDebut: string;
  dateFin: string;
  salleNom: string;
  statutPresence: StatutPresence;
  dateInscription: string;
  dateConfirmation: string | null;
}
