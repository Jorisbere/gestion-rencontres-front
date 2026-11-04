import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EspacePersonnelService } from '../../core/services/espace-personnel.service';
import { Alerte, NiveauAlerte, TypeAlerte } from '../../core/models/alerte.model';

@Component({
  selector: 'app-mes-alertes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-alertes.component.html',
  styleUrl: './mes-alertes.component.scss'
})
export class MesAlertesComponent implements OnInit {
  private readonly espacePersonnelService = inject(EspacePersonnelService);

  readonly alertes = signal<Alerte[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.espacePersonnelService.listerAlertes().subscribe({
      next: (donnees) => {
        this.alertes.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger tes alertes.');
        this.chargement.set(false);
      }
    });
  }

  nonTraitees(): Alerte[] {
    return this.alertes().filter((a) => !a.traitee);
  }

  traitees(): Alerte[] {
    return this.alertes().filter((a) => a.traitee);
  }

  classeNiveau(niveau: NiveauAlerte): string {
    switch (niveau) {
      case 'INFO': return 'pastille-info';
      case 'ATTENTION': return 'pastille-avert';
      case 'CRITIQUE': return 'pastille-danger';
    }
  }

  icone(alerte: Alerte): string {
    if (alerte.traitee) return 'pi-check';
    switch (alerte.type as TypeAlerte) {
      case 'CONFLIT_SALLE': return 'pi-exclamation-triangle';
      case 'RENCONTRE_PROCHE': return 'pi-clock';
      case 'RENCONTRE_PLANIFIEE': return 'pi-calendar-plus';
      case 'RENCONTRE_ANNULEE': return 'pi-calendar-times';
      case 'RENCONTRE_MODIFIEE': return 'pi-pencil';
      case 'COURRIER_RETARD': return 'pi-envelope';
    }
  }
}
