import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Le tableau de bord ADMIN/ORGANISATEUR/SECRETARIAT appelle des endpoints (rencontres,
 * alertes) fermés au rôle AGENT côté backend (403). Un Agent connecté est donc redirigé
 * vers son espace personnel "Mes inscriptions" plutôt que d'atterrir sur une page qui
 * ne pourrait rien charger pour lui.
 */
export const agentRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.aLeRole('AGENT')) {
    return router.parseUrl('/mes-inscriptions');
  }
  return true;
};
