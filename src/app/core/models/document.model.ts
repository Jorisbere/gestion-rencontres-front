export type TypeDocument = 'ORDRE_DU_JOUR' | 'SUPPORT' | 'COMPTE_RENDU' | 'CONVOCATION' | 'AUTRE';

export interface DocumentRencontre {
  id: number;
  rencontreId: number;
  typeDocument: TypeDocument;
  nomFichier: string;
  tailleOctets: number;
  deposeParId: number;
  deposeParNomComplet: string;
  dateDepot: string;
}