import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { AlerteService } from '../../core/services/alerte.service';

const INTERVALLE_POLLING_MS = 30000;

interface ElementNav {
  lien: string;
  icone: string;
  libelle: string;
  role?: 'ADMINISTRATEUR';
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly alerteService = inject(AlerteService);
  private readonly destroyRef = inject(DestroyRef);

  readonly alertesNonTraitees = signal(0);
  readonly menuMobileOuvert = signal(false);

  readonly navigation: ElementNav[] = [
    { lien: '/tableau-de-bord', icone: 'pi-home', libelle: 'Tableau de bord' },
    { lien: '/rencontres', icone: 'pi-calendar', libelle: 'Rencontres' },
    { lien: '/salles', icone: 'pi-building', libelle: 'Salles' },
    { lien: '/participants', icone: 'pi-users', libelle: 'Participants' },
    { lien: '/alertes', icone: 'pi-bell', libelle: 'Alertes' },
    { lien: '/statistiques', icone: 'pi-chart-bar', libelle: 'Statistiques', role: 'ADMINISTRATEUR' },
    { lien: '/utilisateurs', icone: 'pi-shield', libelle: 'Utilisateurs', role: 'ADMINISTRATEUR' },
  ];

  ngOnInit(): void {
    timer(0, INTERVALLE_POLLING_MS)
      .pipe(
        switchMap(() => this.alerteService.compterNonTraitees()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({ next: (reponse) => this.alertesNonTraitees.set(reponse.count) });
  }

  navigationVisible(): ElementNav[] {
    return this.navigation.filter((item) => !item.role || this.authService.aLeRole(item.role));
  }

  initiales(): string {
    const u = this.authService.utilisateurConnecte();
    if (!u) return '';
    return `${u.prenom[0] ?? ''}${u.nom[0] ?? ''}`.toUpperCase();
  }

  basculerMenuMobile(): void {
    this.menuMobileOuvert.set(!this.menuMobileOuvert());
  }
}