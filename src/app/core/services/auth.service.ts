import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UtilisateurConnecte } from '../models/auth.model';

const CLE_TOKEN = 'gr_token';
const CLE_UTILISATEUR = 'gr_utilisateur';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly utilisateurSignal = signal<UtilisateurConnecte | null>(this.lireUtilisateurStocke());

  /** Signal en lecture seule, à consommer dans les composants (ex. header, garde de rôle). */
  readonly utilisateurConnecte = computed(() => this.utilisateurSignal());
  readonly estConnecte = computed(() => this.utilisateurSignal() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  connecter(identifiants: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, identifiants).pipe(
      tap((reponse) => this.enregistrerSession(reponse))
    );
  }

  deconnecter(): void {
    localStorage.removeItem(CLE_TOKEN);
    localStorage.removeItem(CLE_UTILISATEUR);
    this.utilisateurSignal.set(null);
    this.router.navigate(['/connexion']);
  }

  getToken(): string | null {
    return localStorage.getItem(CLE_TOKEN);
  }

  aLeRole(...roles: Array<UtilisateurConnecte['role']>): boolean {
    const utilisateur = this.utilisateurSignal();
    return utilisateur !== null && roles.includes(utilisateur.role);
  }

  private enregistrerSession(reponse: LoginResponse): void {
    const utilisateur: UtilisateurConnecte = {
      userId: reponse.userId,
      nom: reponse.nom,
      prenom: reponse.prenom,
      email: reponse.email,
      role: reponse.role
    };
    localStorage.setItem(CLE_TOKEN, reponse.token);
    localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(utilisateur));
    this.utilisateurSignal.set(utilisateur);
  }

  private lireUtilisateurStocke(): UtilisateurConnecte | null {
    const brut = localStorage.getItem(CLE_UTILISATEUR);
    return brut ? (JSON.parse(brut) as UtilisateurConnecte) : null;
  }
}