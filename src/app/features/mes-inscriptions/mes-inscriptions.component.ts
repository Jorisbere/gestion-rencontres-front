import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { EspacePersonnelService } from '../../core/services/espace-personnel.service';
import { MesInscription } from '../../core/models/mes-inscription.model';
import { StatutPresence } from '../../core/models/inscription.model';
import { StatutRencontre } from '../../core/models/rencontre.model';

@Component({
  selector: 'app-mes-inscriptions',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './mes-inscriptions.component.html',
  styleUrl: './mes-inscriptions.component.scss'
})
export class MesInscriptionsComponent implements OnInit {
  private readonly espacePersonnelService = inject(EspacePersonnelService);

  readonly inscriptions = signal<MesInscription[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.espacePersonnelService.listerInscriptions().subscribe({
      next: (donnees) => {
        this.inscriptions.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger tes inscriptions.');
        this.chargement.set(false);
      }
    });
  }

  aVenir(): MesInscription[] {
    const maintenant = new Date();
    return this.inscriptions().filter((i) => new Date(i.dateDebut) >= maintenant);
  }

  passees(): MesInscription[] {
    const maintenant = new Date();
    return this.inscriptions().filter((i) => new Date(i.dateDebut) < maintenant);
  }

  classeStatutRencontre(statut: StatutRencontre): string {
    switch (statut) {
      case 'PLANIFIEE': return 'pastille-info';
      case 'CONFIRMEE': return 'pastille-succes';
      case 'EN_COURS': return 'pastille-avert';
      case 'TERMINEE': return 'pastille-neutre';
      case 'ANNULEE': return 'pastille-danger';
    }
  }

  classePresence(statut: StatutPresence): string {
    switch (statut) {
      case 'INSCRIT': return 'pastille-info';
      case 'CONFIRME': return 'pastille-succes';
      case 'PRESENT': return 'pastille-succes';
      case 'ABSENT': return 'pastille-avert';
      case 'ANNULE': return 'pastille-danger';
    }
  }
}
