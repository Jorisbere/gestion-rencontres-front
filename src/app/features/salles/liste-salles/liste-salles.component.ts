import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SalleService } from '../../../core/services/salle.service';
import { AuthService } from '../../../core/services/auth.service';
import { Salle } from '../../../core/models/salle.model';

@Component({
  selector: 'app-liste-salles',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, TagModule],
  templateUrl: './liste-salles.component.html',
  styleUrl: './liste-salles.component.scss'
})
export class ListeSallesComponent implements OnInit {
  private readonly salleService = inject(SalleService);
  readonly authService = inject(AuthService);

  readonly salles = signal<Salle[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.salleService.lister().subscribe({
      next: (donnees) => {
        this.salles.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les salles.');
        this.chargement.set(false);
      }
    });
  }

  basculerActivation(salle: Salle): void {
    const appel = salle.actif ? this.salleService.desactiver(salle.id) : this.salleService.activer(salle.id);
    appel.subscribe({
      next: () => this.charger(),
      error: () => this.erreur.set('Impossible de modifier le statut de la salle.')
    });
  }
}