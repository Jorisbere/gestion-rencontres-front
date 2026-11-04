/**
 * Texte libre côté back (V7) : ces 5 valeurs restent proposées comme suggestions dans les
 * formulaires, mais n'importe quel autre type peut être saisi.
 */
export type TypeDocument = string;
export const TYPES_DOCUMENT_SUGGERES: readonly string[] =
  ['ORDRE_DU_JOUR', 'SUPPORT', 'COMPTE_RENDU', 'CONVOCATION', 'AUTRE'];

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