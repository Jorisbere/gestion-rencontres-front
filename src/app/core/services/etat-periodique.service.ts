import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TypeEtat = 'planning' | 'emargement' | 'bilan' | 'recapitulatif';

@Injectable({ providedIn: 'root' })
export class EtatPeriodiqueService {
  private readonly http = inject(HttpClient);

  genererEtat(rencontreId: number, type: TypeEtat, archiver: boolean): Observable<Blob> {
    const url = `${environment.apiUrl}/rencontres/${rencontreId}/etats/${type}?archiver=${archiver}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}