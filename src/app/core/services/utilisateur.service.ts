import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur, UtilisateurRequest } from '../models/utilisateur.model';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/utilisateurs`;

  lister(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.baseUrl);
  }

  creer(dto: UtilisateurRequest): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.baseUrl, dto);
  }

  modifier(id: number, dto: UtilisateurRequest): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.baseUrl}/${id}`, dto);
  }

  toggleStatut(id: number, actif: boolean): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${this.baseUrl}/${id}/statut?actif=${actif}`, {});
  }
}