import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SalleService } from '../../../core/services/salle.service';
import { AuthService } from '../../../core/services/auth.service';
import { Salle } from '../../../core/models/salle.model';

@Component({
  selector: 'app-liste-salles',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, ConfirmPopupModule],
  templateUrl: './liste-salles.component.html',
  styleUrl: './liste-salles.component.scss'
})
export class ListeSallesComponent implements OnInit {
  private readonly salleService = inject(SalleService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
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

  demanderConfirmationActivation(evenement: Event, salle: Salle): void {
    if (!salle.actif) {
      this.basculerActivation(salle);
      return;
    }
    this.confirmationService.confirm({
      target: evenement.target as EventTarget,
      message: `Désactiver la salle « ${salle.nom} » ? Elle ne pourra plus être réservée pour de nouvelles rencontres.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => this.basculerActivation(salle)
    });
  }

  private basculerActivation(salle: Salle): void {
    const appel = salle.actif ? this.salleService.desactiver(salle.id) : this.salleService.activer(salle.id);
    appel.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: salle.actif ? 'Salle désactivée' : 'Salle activée',
          detail: salle.nom
        });
        this.charger();
      },
      error: () => this.erreur.set('Impossible de modifier le statut de la salle.')
    });
  }
}