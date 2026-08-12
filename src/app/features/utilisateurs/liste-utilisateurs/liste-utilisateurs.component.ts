import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { Utilisateur } from '../../../core/models/utilisateur.model';

@Component({
  selector: 'app-liste-utilisateurs',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, ConfirmPopupModule],
  templateUrl: './liste-utilisateurs.component.html',
  styleUrl: './liste-utilisateurs.component.scss'
})
export class ListeUtilisateursComponent implements OnInit {
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly utilisateurs = signal<Utilisateur[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.utilisateurService.lister().subscribe({
      next: (donnees) => {
        this.utilisateurs.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les utilisateurs.');
        this.chargement.set(false);
      }
    });
  }

  demanderConfirmationActivation(evenement: Event, utilisateur: Utilisateur): void {
    if (!utilisateur.actif) {
      this.basculerActivation(utilisateur);
      return;
    }
    this.confirmationService.confirm({
      target: evenement.target as EventTarget,
      message: `Désactiver le compte de ${utilisateur.prenom} ${utilisateur.nom} ? Il perdra l'accès immédiatement, même avec une session déjà ouverte.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => this.basculerActivation(utilisateur)
    });
  }

  private basculerActivation(utilisateur: Utilisateur): void {
    this.utilisateurService.toggleStatut(utilisateur.id, !utilisateur.actif).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: utilisateur.actif ? 'Utilisateur désactivé' : 'Utilisateur activé',
          detail: `${utilisateur.prenom} ${utilisateur.nom}`
        });
        this.charger();
      },
      error: () => this.erreur.set("Impossible de modifier le statut de cet utilisateur.")
    });
  }
}