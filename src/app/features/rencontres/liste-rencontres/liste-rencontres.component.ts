import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { RencontreService } from '../../../core/services/rencontre.service';
import { Rencontre, StatutRencontre } from '../../../core/models/rencontre.model';

@Component({
  selector: 'app-liste-rencontres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TableModule],
  templateUrl: './liste-rencontres.component.html',
  styleUrl: './liste-rencontres.component.scss'
})
export class ListeRencontresComponent implements OnInit {
  private readonly rencontreService = inject(RencontreService);

  readonly rencontres = signal<Rencontre[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);
  readonly statutFiltre = signal<StatutRencontre | ''>('');

  readonly statutsDisponibles: StatutRencontre[] = [
    'PLANIFIEE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'
  ];

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    const statut = this.statutFiltre() || undefined;
    this.rencontreService.lister(statut).subscribe({
      next: (donnees) => {
        this.rencontres.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les rencontres.');
        this.chargement.set(false);
      }
    });
  }

  classeStatut(statut: StatutRencontre): string {
    switch (statut) {
      case 'PLANIFIEE': return 'pastille-info';
      case 'CONFIRMEE': return 'pastille-succes';
      case 'EN_COURS': return 'pastille-avert';
      case 'TERMINEE': return 'pastille-neutre';
      case 'ANNULEE': return 'pastille-danger';
    }
  }

  libelleStatut(statut: StatutRencontre): string {
    switch (statut) {
      case 'PLANIFIEE': return 'Planifiée';
      case 'CONFIRMEE': return 'Confirmée';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'ANNULEE': return 'Annulée';
    }
  }
}