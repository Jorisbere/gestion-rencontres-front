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
      if (erreur.status === 401 || erreur.status === 403) {
        // Token invalide/expiré ou compte désactivé (RG-EF9-06) : retour à la connexion
        authService.deconnecter();
        router.navigate(['/connexion']);
      }
      return throwError(() => erreur);
    })
  );
};