import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../models/utilisateur.model';
import { PasswordUpdateRequest, ProfilUpdateRequest } from '../models/profil.model';

@Injectable({ providedIn: 'root' })
export class ProfilService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth/me`;

  getMoi(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(this.baseUrl);
  }

  modifierProfil(dto: ProfilUpdateRequest): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(this.baseUrl, dto);
  }

  changerMotDePasse(dto: PasswordUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/password`, dto);
  }
}