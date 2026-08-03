export interface IndicateurComptage {
  cle: string;
  valeur: number;
}

export interface RencontresParMois {
  mois: string;
  total: number;
}

export interface TauxPresence {
  totalInscrits: number;
  totalPresents: number;
  tauxPourcentage: number;
}

export interface TauxOccupationSalle {
  salleId: number;
  salleNom: string;
  heuresReservees: number;
  heuresOuvrees: number;
  tauxOccupationPourcentage: number;
}

export interface TableauDeBordStats {
  rencontresParType: IndicateurComptage[];
  rencontresParStatut: IndicateurComptage[];
  rencontresParMois: RencontresParMois[];
  tauxPresence: TauxPresence;
  tauxOccupationSalles: TauxOccupationSalle[];
  participantsDistincts: number;
  volumeCourrierParSens: IndicateurComptage[];
  alertesParType: IndicateurComptage[];
}