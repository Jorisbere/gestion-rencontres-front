import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RechercheResultat } from '../models/recherche.model';

@Injectable({ providedIn: 'root' })
export class RechercheService {
  private readonly http = inject(HttpClient);

  rechercher(q: string): Observable<RechercheResultat[]> {
    return this.http.get<RechercheResultat[]>(
      `${environment.apiUrl}/recherche?q=${encodeURIComponent(q)}`
    );
  }
}
