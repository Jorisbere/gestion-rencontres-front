import { TypeDocument } from './document.model';

export interface MesDocument {
  id: number;
  rencontreId: number;
  rencontreTitre: string;
  typeDocument: TypeDocument;
  nomFichier: string;
  tailleOctets: number;
  deposeParNomComplet: string;
  dateDepot: string;
}
