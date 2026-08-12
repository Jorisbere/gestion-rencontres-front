export type TypeResultatRecherche = 'RENCONTRE' | 'INVITE' | 'AGENT' | 'SALLE' | 'COURRIER';

export interface RechercheResultat {
  type: TypeResultatRecherche;
  id: number;
  titre: string;
  sousTitre: string;
  route: string;
}
