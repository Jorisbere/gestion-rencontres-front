import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { StatistiqueService } from '../../../core/services/statistique.service';
import {
  IndicateurComptage,
  TableauDeBordStats,
  TauxOccupationSalle
} from '../../../core/models/statistique.model';

const OCEAN = '#2E6F9E';
const GOLD = '#C99A3B';
const NAVY = '#16233F';
const SUCCES = '#2F9E63';
const AVERT = '#E1A73B';
const DANGER = '#C0392B';
const NEUTRE = '#B4BAC7';

const COULEURS_STATUT: Record<string, string> = {
  PLANIFIEE: OCEAN,
  CONFIRMEE: SUCCES,
  EN_COURS: AVERT,
  TERMINEE: NEUTRE,
  ANNULEE: DANGER,
};

@Component({
  selector: 'app-tableau-bord-stats',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './tableau-bord-stats.component.html',
  styleUrl: './tableau-bord-stats.component.scss'
})
export class TableauBordStatsComponent implements OnInit {
  private readonly statistiqueService = inject(StatistiqueService);

  readonly donnees = signal<TableauDeBordStats | null>(null);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  readonly optionsLigne = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: '#E2E5EA' }, ticks: { font: { family: 'Inter', size: 11 }, precision: 0 } },
    },
  };

  readonly optionsDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom' as const, labels: { font: { family: 'Inter', size: 11.5 }, padding: 10, boxWidth: 10, usePointStyle: true } },
    },
  };

  readonly optionsBarreHorizontale = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#E2E5EA' }, ticks: { font: { family: 'Inter', size: 11 } }, max: 100 },
      y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11.5 } } },
    },
    indexAxis: 'y' as const,
  };

  chartRencontresParMois: any;
  chartRencontresParStatut: any;
  chartOccupationSalles: any;

  ngOnInit(): void {
    this.statistiqueService.getTableauDeBord().subscribe({
      next: (reponse) => {
        this.donnees.set(reponse);
        this.construireGraphiques(reponse);
        this.chargement.set(false);
      },
      error: (erreur) => {
        this.erreur.set(
          erreur.status === 403 ? 'Accès réservé aux administrateurs.' : 'Impossible de charger les statistiques.'
        );
        this.chargement.set(false);
      }
    });
  }

  totalRencontres(): number {
    const d = this.donnees();
    return d ? d.rencontresParStatut.reduce((s, i) => s + i.valeur, 0) : 0;
  }

  // ---- Barres CSS légères (sections secondaires) ----

  pourcentageBarre(valeur: number, liste: IndicateurComptage[]): number {
    const max = Math.max(...liste.map((i) => i.valeur), 1);
    return (valeur / max) * 100;
  }

  // ---- Graphiques Chart.js (sections principales) ----

  private construireGraphiques(d: TableauDeBordStats): void {
    this.chartRencontresParMois = {
      labels: d.rencontresParMois.map((i) => i.mois),
      datasets: [{
        label: 'Rencontres',
        data: d.rencontresParMois.map((i) => i.total),
        borderColor: OCEAN,
        backgroundColor: 'rgba(46, 111, 158, 0.1)',
        pointBackgroundColor: GOLD,
        pointBorderColor: GOLD,
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      }],
    };

    this.chartRencontresParStatut = {
      labels: d.rencontresParStatut.map((i) => i.cle),
      datasets: [{
        data: d.rencontresParStatut.map((i) => i.valeur),
        backgroundColor: d.rencontresParStatut.map((i) => COULEURS_STATUT[i.cle] ?? NEUTRE),
        borderWidth: 0,
      }],
    };

    this.chartOccupationSalles = {
      labels: d.tauxOccupationSalles.map((s) => s.salleNom),
      datasets: [{
        data: d.tauxOccupationSalles.map((s) => s.tauxOccupationPourcentage),
        backgroundColor: d.tauxOccupationSalles.map((s) => this.couleurOccupation(s)),
        borderRadius: 5,
        barThickness: 16,
      }],
    };
  }

  private couleurOccupation(s: TauxOccupationSalle): string {
    if (s.tauxOccupationPourcentage >= 85) return DANGER;
    if (s.tauxOccupationPourcentage >= 60) return AVERT;
    return SUCCES;
  }
}