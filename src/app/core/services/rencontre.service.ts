import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rencontre, RencontreRequest, StatutRencontre } from '../models/rencontre.model';

@Injectable({ providedIn: 'root' })
export class RencontreService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rencontres`;

  lister(statut?: StatutRencontre): Observable<Rencontre[]> {
    const url = statut ? `${this.baseUrl}?statut=${statut}` : this.baseUrl;
    return this.http.get<Rencontre[]>(url);
  }

  getDetail(id: number): Observable<Rencontre> {
    return this.http.get<Rencontre>(`${this.baseUrl}/${id}`);
  }

  creer(dto: RencontreRequest): Observable<Rencontre> {
    return this.http.post<Rencontre>(this.baseUrl, dto);
  }

  changerStatut(id: number, nouveauStatut: StatutRencontre): Observable<Rencontre> {
    return this.http.patch<Rencontre>(`${this.baseUrl}/${id}/statut?nouveauStatut=${nouveauStatut}`, {});
  }
}