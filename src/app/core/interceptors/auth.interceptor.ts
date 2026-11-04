import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (requete, suite) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const requeteAvecToken = token
    ? requete.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : requete;

  return suite(requeteAvecToken).pipe(
    catchError((erreur) => {
      // Uniquement 401 : token invalide/expiré, la session elle-même n'est plus valide.
      // Un 403 signifie une session valide mais une action refusée sur CETTE ressource
      // précise (ex. modifier la rencontre d'un autre organisateur, RG-EF9-06 compte
      // désactivé) — l'utilisateur reste connecté, l'écran affiche l'erreur normalement.
      if (erreur.status === 401) {
        authService.deconnecter();
        router.navigate(['/connexion']);
      }
      return throwError(() => erreur);
    })
  );
};