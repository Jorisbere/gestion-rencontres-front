import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Courrier, CourrierRequest, StatutCourrier } from '../models/courrier.model';

@Injectable({ providedIn: 'root' })
export class CourrierService {
  private readonly http = inject(HttpClient);

  private baseUrl(rencontreId: number): string {
    return `${environment.apiUrl}/rencontres/${rencontreId}/courriers`;
  }

  lister(rencontreId: number): Observable<Courrier[]> {
    return this.http.get<Courrier[]>(this.baseUrl(rencontreId));
  }

  creer(rencontreId: number, dto: CourrierRequest): Observable<Courrier> {
    return this.http.post<Courrier>(this.baseUrl(rencontreId), dto);
  }

  changerStatut(rencontreId: number, courrierId: number, statut: StatutCourrier): Observable<Courrier> {
    return this.http.patch<Courrier>(
      `${this.baseUrl(rencontreId)}/${courrierId}/statut?statut=${statut}`, {}
    );
  }
}