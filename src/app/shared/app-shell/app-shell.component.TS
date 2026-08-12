import { Component, DestroyRef, HostListener, OnInit, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { AlerteService } from '../../core/services/alerte.service';
import { RechercheService } from '../../core/services/recherche.service';
import { RechercheResultat, TypeResultatRecherche } from '../../core/models/recherche.model';
import { Alerte, NiveauAlerte } from '../../core/models/alerte.model';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

const NB_ALERTES_APERCU = 5;

const INTERVALLE_POLLING_MS = 30000;
const LONGUEUR_MIN_RECHERCHE = 2;
/** Anticipation de l'avertissement d'expiration de session, avant la revendication "exp" du JWT. */
const AVERTISSEMENT_EXPIRATION_MS = 5 * 60 * 1000;

interface ElementNav {
  lien: string;
  icone: string;
  libelle: string;
  role?: 'ADMINISTRATEUR';
  /** Endpoints fermés au rôle AGENT côté back (403) : à masquer pour ce rôle. */
  masquePourAgent?: boolean;
  /** Réservé au rôle AGENT : redondant pour les autres rôles qui ont déjà l'écran complet équivalent. */
  reservePourAgent?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, BreadcrumbComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly alerteService = inject(AlerteService);
  private readonly rechercheService = inject(RechercheService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly alertesNonTraitees = signal(0);
  readonly menuMobileOuvert = signal(false);

  readonly apercuAlertesOuvert = signal(false);
  readonly alertesApercu = signal<Alerte[]>([]);
  readonly chargementApercuAlertes = signal(false);

  readonly resultatsRecherche = signal<RechercheResultat[]>([]);
  readonly rechercheOuverte = signal(false);
  readonly rechercheEnCours = signal(false);
  readonly indexSurligne = signal(-1);
  readonly valeurRecherche = signal('');
  /** Recherche plein écran (mobile) : bascule distincte du dropdown desktop, même état sous-jacent. */
  readonly rechercheMobileOuverte = signal(false);
  private readonly rechercheSaisie = new Subject<string>();
  private readonly champRecherche = viewChild<ElementRef<HTMLInputElement>>('champRecherche');
  private readonly champRechercheMobile = viewChild<ElementRef<HTMLInputElement>>('champRechercheMobile');

  readonly navigation: ElementNav[] = [
    { lien: '/tableau-de-bord', icone: 'pi-home', libelle: 'Tableau de bord', masquePourAgent: true },
    { lien: '/mes-inscriptions', icone: 'pi-calendar-plus', libelle: 'Mes inscriptions' },
    // Redondant avec "Alertes" (superset) pour ADMIN/ORGANISATEUR/SECRETARIAT, qui l'ont déjà —
    // utile uniquement pour AGENT, seul rôle sans accès à "Alertes".
    { lien: '/mes-alertes', icone: 'pi-bell', libelle: 'Mes alertes', reservePourAgent: true },
    { lien: '/mes-documents', icone: 'pi-file', libelle: 'Mes documents' },
    { lien: '/rencontres', icone: 'pi-calendar', libelle: 'Rencontres', masquePourAgent: true },
    { lien: '/salles', icone: 'pi-building', libelle: 'Salles', masquePourAgent: true },
    { lien: '/invites', icone: 'pi-users', libelle: 'Invités', masquePourAgent: true },
    { lien: '/alertes', icone: 'pi-bell', libelle: 'Alertes', masquePourAgent: true },
    { lien: '/statistiques', icone: 'pi-chart-bar', libelle: 'Statistiques', role: 'ADMINISTRATEUR' },
    { lien: '/agents', icone: 'pi-id-card', libelle: 'Agents', role: 'ADMINISTRATEUR' },
    { lien: '/utilisateurs', icone: 'pi-shield', libelle: 'Utilisateurs', role: 'ADMINISTRATEUR' },
  ];

  ngOnInit(): void {
    // Le comptage d'alertes non traitées et la recherche globale sont fermés au rôle
    // AGENT côté back (403) — inutile de les sonder pour un compte qui n'y a pas accès.
    if (!this.authService.aLeRole('AGENT')) {
      timer(0, INTERVALLE_POLLING_MS)
        .pipe(
          switchMap(() => this.alerteService.compterNonTraitees()),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (reponse) => {
            this.alertesNonTraitees.set(reponse.count);
            // Rafraîchit aussi l'aperçu s'il est ouvert, sur le même tempo — évite un
            // second polling dédié.
            if (this.apercuAlertesOuvert()) {
              this.chargerApercuAlertes();
            }
          }
        });
    }

    this.rechercheSaisie
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.trim().length < LONGUEUR_MIN_RECHERCHE) {
            this.rechercheEnCours.set(false);
            return of<RechercheResultat[]>([]);
          }
          this.rechercheEnCours.set(true);
          return this.rechercheService.rechercher(q.trim());
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (resultats) => {
          this.resultatsRecherche.set(resultats);
          this.rechercheEnCours.set(false);
          this.indexSurligne.set(-1);
        },
        error: () => {
          this.resultatsRecherche.set([]);
          this.rechercheEnCours.set(false);
          this.indexSurligne.set(-1);
        }
      });

    this.planifierAvertissementExpiration();
  }

  /** Programme un toast d'avertissement quelques minutes avant l'expiration du JWT (8h),
   * pour laisser le temps de terminer une saisie avant la déconnexion automatique. */
  private planifierAvertissementExpiration(): void {
    const expiration = this.authService.dateExpirationToken();
    if (!expiration) return;

    const delai = expiration.getTime() - Date.now() - AVERTISSEMENT_EXPIRATION_MS;
    if (delai <= 0) return;

    timer(delai)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Session bientôt expirée',
          detail: 'Ta session va expirer dans quelques minutes. Termine tes saisies en cours, puis reconnecte-toi.',
          sticky: true
        });
      });
  }

  /** Raccourci "/" : focus la recherche globale depuis n'importe où, sauf si on est déjà
   * en train de saisir dans un champ (pour ne pas voler la frappe d'un formulaire). */
  @HostListener('document:keydown', ['$event'])
  surRaccourciClavier(evenement: KeyboardEvent): void {
    if (evenement.key !== '/' || this.authService.aLeRole('AGENT')) return;

    const cible = evenement.target as HTMLElement | null;
    const dansUnChamp =
      cible && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA' || cible.isContentEditable);
    if (dansUnChamp) return;

    evenement.preventDefault();
    this.champRecherche()?.nativeElement.focus();
  }

  navigationVisible(): ElementNav[] {
    const estAgent = this.authService.aLeRole('AGENT');
    return this.navigation.filter((item) => {
      if (item.masquePourAgent && estAgent) return false;
      if (item.reservePourAgent && !estAgent) return false;
      return !item.role || this.authService.aLeRole(item.role);
    });
  }

  initiales(): string {
    const u = this.authService.utilisateurConnecte();
    if (!u) return '';
    return `${u.prenom[0] ?? ''}${u.nom[0] ?? ''}`.toUpperCase();
  }

  basculerMenuMobile(): void {
    this.menuMobileOuvert.set(!this.menuMobileOuvert());
  }

  // ---- Recherche globale ----

  onRechercheInput(evenement: Event): void {
    const valeur = (evenement.target as HTMLInputElement).value;
    this.valeurRecherche.set(valeur);
    this.rechercheOuverte.set(valeur.trim().length >= LONGUEUR_MIN_RECHERCHE);
    if (valeur.trim().length < LONGUEUR_MIN_RECHERCHE) {
      this.resultatsRecherche.set([]);
    }
    this.rechercheSaisie.next(valeur);
  }

  reouvrirRecherche(evenement: Event): void {
    const valeur = (evenement.target as HTMLInputElement).value;
    if (valeur.trim().length >= LONGUEUR_MIN_RECHERCHE) {
      this.rechercheOuverte.set(true);
    }
  }

  fermerRecherche(): void {
    // Délai court pour laisser le clic (mousedown) sur un résultat s'exécuter avant fermeture.
    setTimeout(() => this.rechercheOuverte.set(false), 150);
  }

  allerVersResultat(resultat: RechercheResultat): void {
    this.rechercheOuverte.set(false);
    this.rechercheMobileOuverte.set(false);
    this.router.navigateByUrl(resultat.route);
  }

  onRechercheKeydown(evenement: KeyboardEvent): void {
    if (evenement.key === 'Escape') {
      this.rechercheOuverte.set(false);
      this.rechercheMobileOuverte.set(false);
      this.champRecherche()?.nativeElement.blur();
      return;
    }

    const resultats = this.resultatsRecherche();
    if (resultats.length === 0) return;

    switch (evenement.key) {
      case 'ArrowDown':
        evenement.preventDefault();
        this.indexSurligne.set(Math.min(this.indexSurligne() + 1, resultats.length - 1));
        break;
      case 'ArrowUp':
        evenement.preventDefault();
        this.indexSurligne.set(Math.max(this.indexSurligne() - 1, 0));
        break;
      case 'Enter': {
        evenement.preventDefault();
        const cible = resultats[this.indexSurligne()] ?? resultats[0];
        this.allerVersResultat(cible);
        break;
      }
    }
  }

  // ---- Recherche globale — plein écran (mobile) ----

  basculerRechercheMobile(): void {
    this.rechercheMobileOuverte.set(true);
    this.valeurRecherche.set('');
    this.resultatsRecherche.set([]);
    setTimeout(() => this.champRechercheMobile()?.nativeElement.focus(), 0);
  }

  fermerRechercheMobile(): void {
    this.rechercheMobileOuverte.set(false);
  }

  iconePourType(type: TypeResultatRecherche): string {
    switch (type) {
      case 'RENCONTRE': return 'pi-calendar';
      case 'INVITE': return 'pi-user';
      case 'AGENT': return 'pi-id-card';
      case 'SALLE': return 'pi-building';
      case 'COURRIER': return 'pi-envelope';
    }
  }

  // ---- Aperçu des alertes (cloche) ----

  basculerApercuAlertes(): void {
    const ouvre = !this.apercuAlertesOuvert();
    this.apercuAlertesOuvert.set(ouvre);
    if (ouvre) {
      this.chargerApercuAlertes();
    }
  }

  private chargerApercuAlertes(): void {
    this.chargementApercuAlertes.set(true);
    this.alerteService.lister(false).subscribe({
      next: (donnees) => {
        this.alertesApercu.set(donnees.slice(0, NB_ALERTES_APERCU));
        this.chargementApercuAlertes.set(false);
      },
      error: () => this.chargementApercuAlertes.set(false)
    });
  }

  fermerApercuAlertes(): void {
    // Délai court pour laisser le clic (mousedown) sur une alerte s'exécuter avant fermeture.
    setTimeout(() => this.apercuAlertesOuvert.set(false), 150);
  }

  allerVersAlerte(alerte: Alerte): void {
    this.apercuAlertesOuvert.set(false);
    if (alerte.rencontreId) {
      this.router.navigate(['/rencontres', alerte.rencontreId]);
    } else {
      this.router.navigateByUrl('/alertes');
    }
  }

  classeNiveauAlerte(niveau: NiveauAlerte): string {
    switch (niveau) {
      case 'INFO': return 'pastille-info';
      case 'ATTENTION': return 'pastille-avert';
      case 'CRITIQUE': return 'pastille-danger';
    }
  }
}
