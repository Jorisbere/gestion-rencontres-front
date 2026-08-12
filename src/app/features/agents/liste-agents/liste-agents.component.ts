import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AgentService } from '../../../core/services/agent.service';
import { Agent } from '../../../core/models/agent.model';
import { exporterCsv } from '../../../core/utils/csv.util';

@Component({
  selector: 'app-liste-agents',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, ConfirmPopupModule],
  templateUrl: './liste-agents.component.html',
  styleUrl: './liste-agents.component.scss'
})
export class ListeAgentsComponent implements OnInit {
  private readonly agentService = inject(AgentService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly agents = signal<Agent[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.agentService.lister().subscribe({
      next: (donnees) => {
        this.agents.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les agents.');
        this.chargement.set(false);
      }
    });
  }

  exporter(): void {
    exporterCsv(
      'agents',
      [
        { entete: 'Nom', valeur: (a: Agent) => a.nom },
        { entete: 'Prénom', valeur: (a: Agent) => a.prenom },
        { entete: 'Email', valeur: (a: Agent) => a.email },
        { entete: 'Fonction', valeur: (a: Agent) => a.fonction ?? '' },
        { entete: 'Compte', valeur: (a: Agent) => (a.possedeUnCompte ? 'Oui' : 'Non') },
        { entete: 'Statut', valeur: (a: Agent) => (a.actif ? 'Actif' : 'Inactif') }
      ],
      this.agents()
    );
  }

  demanderConfirmationActivation(evenement: Event, agent: Agent): void {
    if (!agent.actif) {
      this.basculerActivation(agent);
      return;
    }
    this.confirmationService.confirm({
      target: evenement.target as EventTarget,
      message: `Désactiver ${agent.prenom} ${agent.nom} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => this.basculerActivation(agent)
    });
  }

  private basculerActivation(agent: Agent): void {
    this.agentService.toggleStatut(agent.id, !agent.actif).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: agent.actif ? 'Agent désactivé' : 'Agent activé',
          detail: `${agent.prenom} ${agent.nom}`
        });
        this.charger();
      },
      error: () => this.erreur.set("Impossible de modifier le statut de cet agent.")
    });
  }
}
