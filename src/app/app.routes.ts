import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'tableau-de-bord',
        loadComponent: () =>
          import('./features/tableau-de-bord/tableau-de-bord.component').then((m) => m.TableauDeBordComponent)
      },
      {
        path: 'rencontres',
        loadComponent: () =>
          import('./features/rencontres/liste-rencontres/liste-rencontres.component').then(
            (m) => m.ListeRencontresComponent
          )
      },
      {
        path: 'rencontres/planifier',
        loadComponent: () =>
          import('./features/rencontres/planifier-rencontre/planifier-rencontre.component').then(
            (m) => m.PlanifierRencontreComponent
          )
      },
      {
        path: 'rencontres/:id',
        loadComponent: () =>
          import('./features/rencontres/detail-rencontre/detail-rencontre.component').then(
            (m) => m.DetailRencontreComponent
          )
      },
      {
        path: 'salles',
        loadComponent: () =>
          import('./features/salles/liste-salles/liste-salles.component').then((m) => m.ListeSallesComponent)
      },
      {
        path: 'salles/creer',
        loadComponent: () =>
          import('./features/salles/creer-salle/creer-salle.component').then((m) => m.CreerSalleComponent)
      },
      {
        path: 'participants',
        loadComponent: () =>
          import('./features/participants/liste-participants/liste-participants.component').then(
            (m) => m.ListeParticipantsComponent
          )
      },
      {
        path: 'participants/creer',
        loadComponent: () =>
          import('./features/participants/creer-participant/creer-participant.component').then(
            (m) => m.CreerParticipantComponent
          )
      },
      {
        path: 'alertes',
        loadComponent: () =>
          import('./features/alertes/liste-alertes/liste-alertes.component').then((m) => m.ListeAlertesComponent)
      },
      {
        path: 'statistiques',
        loadComponent: () =>
          import('./features/statistiques/tableau-bord-stats/tableau-bord-stats.component').then(
            (m) => m.TableauBordStatsComponent
          )
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('./features/utilisateurs/liste-utilisateurs/liste-utilisateurs.component').then(
            (m) => m.ListeUtilisateursComponent
          )
      },
      {
        path: 'utilisateurs/creer',
        loadComponent: () =>
          import('./features/utilisateurs/creer-utilisateur/creer-utilisateur.component').then(
            (m) => m.CreerUtilisateurComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: 'tableau-de-bord' }
];