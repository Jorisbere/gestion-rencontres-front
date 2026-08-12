import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InviteService } from '../../../core/services/invite.service';
import { Invite } from '../../../core/models/invite.model';
import { exporterCsv } from '../../../core/utils/csv.util';

@Component({
  selector: 'app-liste-invites',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, ConfirmPopupModule],
  templateUrl: './liste-invites.component.html',
  styleUrl: './liste-invites.component.scss'
})
export class ListeInvitesComponent implements OnInit {
  private readonly inviteService = inject(InviteService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly invites = signal<Invite[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.inviteService.lister().subscribe({
      next: (donnees) => {
        this.invites.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les invités.');
        this.chargement.set(false);
      }
    });
  }

  /** Colonne "Organisation" du tableau : structureAffiliation ou nomStructure selon le type. */
  organisationAffichee(invite: Invite): string {
    const valeur = invite.typeParticipant === 'PHYSIQUE' ? invite.structureAffiliation : invite.nomStructure;
    return valeur || '—';
  }

  exporter(): void {
    exporterCsv(
      'invites',
      [
        { entete: 'Nom / Structure', valeur: (i: Invite) => i.libelle },
        { entete: 'Type', valeur: (i: Invite) => (i.typeParticipant === 'PHYSIQUE' ? 'Personne' : 'Structure') },
        { entete: 'Email', valeur: (i: Invite) => i.email },
        { entete: 'Organisation', valeur: (i: Invite) => this.organisationAffichee(i) },
        { entete: 'Contact', valeur: (i: Invite) => i.contact ?? '' },
        { entete: 'Statut', valeur: (i: Invite) => (i.actif ? 'Actif' : 'Inactif') }
      ],
      this.invites()
    );
  }

  demanderConfirmationActivation(evenement: Event, invite: Invite): void {
    if (!invite.actif) {
      this.basculerActivation(invite);
      return;
    }
    this.confirmationService.confirm({
      target: evenement.target as EventTarget,
      message: `Désactiver ${invite.libelle} ? Il ne pourra plus être inscrit à de nouvelles rencontres.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => this.basculerActivation(invite)
    });
  }

  private basculerActivation(invite: Invite): void {
    const appel = invite.actif
      ? this.inviteService.desactiver(invite.id)
      : this.inviteService.activer(invite.id);
    appel.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: invite.actif ? 'Invité désactivé' : 'Invité activé',
          detail: invite.libelle
        });
        this.charger();
      },
      error: () => this.erreur.set("Impossible de modifier le statut de cet invité.")
    });
  }
}
