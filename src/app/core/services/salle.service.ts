import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Salle, SalleRequest } from '../models/salle.model';

@Injectable({ providedIn: 'root' })
export class SalleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/salles`;

  lister(actif?: boolean): Observable<Salle[]> {
    const url = actif === undefined ? this.baseUrl : `${this.baseUrl}?actif=${actif}`;
    return this.http.get<Salle[]>(url);
  }

  getDetail(id: number): Observable<Salle> {
    return this.http.get<Salle>(`${this.baseUrl}/${id}`);
  }

  creer(dto: SalleRequest): Observable<Salle> {
    return this.http.post<Salle>(this.baseUrl, dto);
  }

  modifier(id: number, dto: SalleRequest): Observable<Salle> {
    return this.http.put<Salle>(`${this.baseUrl}/${id}`, dto);
  }

  desactiver(id: number): Observable<Salle> {
    return this.http.patch<Salle>(`${this.baseUrl}/${id}/desactiver`, {});
  }

  activer(id: number): Observable<Salle> {
    return this.http.patch<Salle>(`${this.baseUrl}/${id}/activer`, {});
  }
}