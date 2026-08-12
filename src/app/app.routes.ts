import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { agentRedirectGuard } from './core/guards/agent-redirect.guard';
import { BreadcrumbSegment } from './shared/breadcrumb/breadcrumb.component';

export const routes: Routes = [
  { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'mon-profil',
        data: { breadcrumb: [{ label: 'Mon profil' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/mon-profil/mon-profil.component').then((m) => m.MonProfilComponent)
      },
      {
        path: 'tableau-de-bord',
        canActivate: [agentRedirectGuard],
        loadComponent: () =>
          import('./features/tableau-de-bord/tableau-de-bord.component').then((m) => m.TableauDeBordComponent)
      },
      {
        path: 'mes-inscriptions',
        data: { breadcrumb: [{ label: 'Mes inscriptions' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/mes-inscriptions/mes-inscriptions.component').then(
            (m) => m.MesInscriptionsComponent
          )
      },
      {
        path: 'mes-alertes',
        data: { breadcrumb: [{ label: 'Mes alertes' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/mes-alertes/mes-alertes.component').then((m) => m.MesAlertesComponent)
      },
      {
        path: 'mes-documents',
        data: { breadcrumb: [{ label: 'Mes documents' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/mes-documents/mes-documents.component').then((m) => m.MesDocumentsComponent)
      },
      {
        path: 'rencontres',
        data: { breadcrumb: [{ label: 'Rencontres' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/rencontres/liste-rencontres/liste-rencontres.component').then(
            (m) => m.ListeRencontresComponent
          )
      },
      {
        path: 'rencontres/planifier',
        data: {
          breadcrumb: [
            { label: 'Rencontres', link: '/rencontres' },
            { label: 'Planifier' }
          ] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/rencontres/planifier-rencontre/planifier-rencontre.component').then(
            (m) => m.PlanifierRencontreComponent
          )
      },
      {
        path: 'rencontres/:id',
        data: {
          breadcrumb: [
            { label: 'Rencontres', link: '/rencontres' },
            { label: 'Détail' }
          ] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/rencontres/detail-rencontre/detail-rencontre.component').then(
            (m) => m.DetailRencontreComponent
          )
      },
      {
        path: 'rencontres/:id/modifier',
        data: {
          breadcrumb: [
            { label: 'Rencontres', link: '/rencontres' },
            { label: 'Détail', link: '/rencontres/:id' },
            { label: 'Modifier' }
          ] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/rencontres/modifier-rencontre/modifier-rencontre.component').then(
            (m) => m.ModifierRencontreComponent
          )
      },
      {
        path: 'salles',
        data: { breadcrumb: [{ label: 'Salles' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/salles/liste-salles/liste-salles.component').then((m) => m.ListeSallesComponent)
      },
      {
        path: 'salles/creer',
        data: {
          breadcrumb: [{ label: 'Salles', link: '/salles' }, { label: 'Créer' }] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/salles/creer-salle/creer-salle.component').then((m) => m.CreerSalleComponent)
      },
      {
        path: 'salles/:id/modifier',
        data: {
          breadcrumb: [{ label: 'Salles', link: '/salles' }, { label: 'Modifier' }] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/salles/modifier-salle/modifier-salle.component').then((m) => m.ModifierSalleComponent)
      },
      {
        path: 'invites',
        data: { breadcrumb: [{ label: 'Invités' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/invites/liste-invites/liste-invites.component').then(
            (m) => m.ListeInvitesComponent
          )
      },
      {
        path: 'invites/creer',
        data: {
          breadcrumb: [{ label: 'Invités', link: '/invites' }, { label: 'Ajouter' }] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/invites/creer-invite/creer-invite.component').then(
            (m) => m.CreerInviteComponent
          )
      },
      {
        path: 'invites/:id/modifier',
        data: {
          breadcrumb: [{ label: 'Invités', link: '/invites' }, { label: 'Modifier' }] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/invites/modifier-invite/modifier-invite.component').then(
            (m) => m.ModifierInviteComponent
          )
      },
      {
        path: 'agents',
        data: { breadcrumb: [{ label: 'Agents' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/agents/liste-agents/liste-agents.component').then(
            (m) => m.ListeAgentsComponent
          )
      },
      {
        path: 'agents/creer',
        data: {
          breadcrumb: [{ label: 'Agents', link: '/agents' }, { label: 'Ajouter' }] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/agents/creer-agent/creer-agent.component').then(
            (m) => m.CreerAgentComponent
          )
      },
      {
        path: 'agents/:id/modifier',
        data: {
          breadcrumb: [{ label: 'Agents', link: '/agents' }, { label: 'Modifier' }] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/agents/modifier-agent/modifier-agent.component').then(
            (m) => m.ModifierAgentComponent
          )
      },
      {
        path: 'alertes',
        data: { breadcrumb: [{ label: 'Alertes' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/alertes/liste-alertes/liste-alertes.component').then((m) => m.ListeAlertesComponent)
      },
      {
        path: 'utilisateurs/:id/modifier',
        data: {
          breadcrumb: [
            { label: 'Utilisateurs', link: '/utilisateurs' },
            { label: 'Modifier' }
          ] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/utilisateurs/modifier-utilisateur/modifier-utilisateur.component').then(
            (m) => m.ModifierUtilisateurComponent
          )
      },
      {
        path: 'statistiques',
        data: { breadcrumb: [{ label: 'Statistiques' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/statistiques/tableau-bord-stats/tableau-bord-stats.component').then(
            (m) => m.TableauBordStatsComponent
          )
      },
      {
        path: 'utilisateurs',
        data: { breadcrumb: [{ label: 'Utilisateurs' }] satisfies BreadcrumbSegment[] },
        loadComponent: () =>
          import('./features/utilisateurs/liste-utilisateurs/liste-utilisateurs.component').then(
            (m) => m.ListeUtilisateursComponent
          )
      },
      {
        path: 'utilisateurs/creer',
        data: {
          breadcrumb: [
            { label: 'Utilisateurs', link: '/utilisateurs' },
            { label: 'Créer' }
          ] satisfies BreadcrumbSegment[]
        },
        loadComponent: () =>
          import('./features/utilisateurs/creer-utilisateur/creer-utilisateur.component').then(
            (m) => m.CreerUtilisateurComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: 'tableau-de-bord' }
];
