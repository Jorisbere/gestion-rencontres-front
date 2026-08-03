import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alerte } from '../models/alerte.model';

@Injectable({ providedIn: 'root' })
export class AlerteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/alertes`;

  lister(traitee?: boolean): Observable<Alerte[]> {
    const url = traitee === undefined ? this.baseUrl : `${this.baseUrl}?traitee=${traitee}`;
    return this.http.get<Alerte[]>(url);
  }

  compterNonTraitees(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/non-traitees/count`);
  }

  traiter(id: number): Observable<Alerte> {
    return this.http.patch<Alerte>(`${this.baseUrl}/${id}/traiter`, {});
  }
}