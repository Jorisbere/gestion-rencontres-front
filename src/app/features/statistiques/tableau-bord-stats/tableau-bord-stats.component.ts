import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatistiqueService } from '../../../core/services/statistique.service';
import {
  IndicateurComptage,
  RencontresParMois,
  TableauDeBordStats,
  TauxOccupationSalle
} from '../../../core/models/statistique.model';

@Component({
  selector: 'app-tableau-bord-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tableau-bord-stats.component.html',
  styleUrl: './tableau-bord-stats.component.scss'
})
export class TableauBordStatsComponent implements OnInit {
  private readonly statistiqueService = inject(StatistiqueService);

  readonly donnees = signal<TableauDeBordStats | null>(null);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.statistiqueService.getTableauDeBord().subscribe({
      next: (reponse) => {
        this.donnees.set(reponse);
        this.chargement.set(false);
      },
      error: (erreur) => {
        this.erreur.set(
          erreur.status === 403
            ? 'Accès réservé aux administrateurs.'
            : 'Impossible de charger les statistiques.'
        );
        this.chargement.set(false);
      }
    });
  }

  totalRencontres(): number {
    const d = this.donnees();
    return d ? d.rencontresParStatut.reduce((somme, item) => somme + item.valeur, 0) : 0;
  }

  pourcentageBarre(valeur: number, liste: IndicateurComptage[]): number {
    const max = Math.max(...liste.map((i) => i.valeur), 1);
    return (valeur / max) * 100;
  }

  pourcentageBarreMois(valeur: number, liste: RencontresParMois[]): number {
    const max = Math.max(...liste.map((i) => i.total), 1);
    return (valeur / max) * 100;
  }

  pourcentageBarreOccupation(salle: TauxOccupationSalle): number {
    return Math.min(salle.tauxOccupationPourcentage, 100);
  }
}