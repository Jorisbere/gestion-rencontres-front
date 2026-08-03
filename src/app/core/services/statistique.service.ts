import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TableauDeBordStats } from '../models/statistique.model';

@Injectable({ providedIn: 'root' })
export class StatistiqueService {
  private readonly http = inject(HttpClient);

  getTableauDeBord(): Observable<TableauDeBordStats> {
    return this.http.get<TableauDeBordStats>(`${environment.apiUrl}/stats/tableau-de-bord`);
  }
}