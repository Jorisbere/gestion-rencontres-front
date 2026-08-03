import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AlerteService } from '../../core/services/alerte.service';
import { RencontreService } from '../../core/services/rencontre.service';
import { Rencontre } from '../../core/models/rencontre.model';
import { Alerte, NiveauAlerte } from '../../core/models/alerte.model';

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tableau-de-bord.component.html',
  styleUrl: './tableau-de-bord.component.scss'
})
export class TableauDeBordComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly alerteService = inject(AlerteService);
  private readonly rencontreService = inject(RencontreService);
  private readonly destroyRef = inject(DestroyRef);

  readonly chargement = signal(true);
  readonly prochainesRencontres = signal<Rencontre[]>([]);
  readonly alertesRecentes = signal<Alerte[]>([]);
  readonly rencontresCetteSemaine = signal(0);
  readonly alertesNonTraitees = signal(0);
  readonly rencontresConfirmees = signal(0);

  ngOnInit(): void {
    forkJoin({
      rencontres: this.rencontreService.lister(),
      alertes: this.alerteService.lister(false),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ rencontres, alertes }) => {
          const maintenant = new Date();
          const dansUneSemaine = new Date(maintenant.getTime() + 7 * 24 * 60 * 60 * 1000);

          const aVenir = rencontres
            .filter((r) => new Date(r.dateDebut) >= maintenant && r.statut !== 'ANNULEE')
            .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());

          this.prochainesRencontres.set(aVenir.slice(0, 5));
          this.rencontresCetteSemaine.set(
            aVenir.filter((r) => new Date(r.dateDebut) <= dansUneSemaine).length
          );
          this.rencontresConfirmees.set(rencontres.filter((r) => r.statut === 'CONFIRMEE').length);

          this.alertesRecentes.set(alertes.slice(0, 5));
          this.alertesNonTraitees.set(alertes.length);

          this.chargement.set(false);
        },
        error: () => this.chargement.set(false)
      });
  }

  saluation(): string {
    const heure = new Date().getHours();
    if (heure < 12) return 'Bonjour';
    if (heure < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  classeNiveau(niveau: NiveauAlerte): string {
    switch (niveau) {
      case 'INFO': return 'pastille-info';
      case 'ATTENTION': return 'pastille-avert';
      case 'CRITIQUE': return 'pastille-danger';
    }
  }
}