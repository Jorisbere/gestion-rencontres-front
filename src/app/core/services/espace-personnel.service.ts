import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MesInscription } from '../models/mes-inscription.model';
import { Alerte } from '../models/alerte.model';
import { MesDocument } from '../models/mes-document.model';

/** Espace self-service "Mes inscriptions / mes alertes / mes documents" (acteur Agent). */
@Injectable({ providedIn: 'root' })
export class EspacePersonnelService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/moi`;

  listerInscriptions(): Observable<MesInscription[]> {
    return this.http.get<MesInscription[]>(`${this.baseUrl}/inscriptions`);
  }

  listerAlertes(): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${this.baseUrl}/alertes`);
  }

  listerDocuments(): Observable<MesDocument[]> {
    return this.http.get<MesDocument[]>(`${this.baseUrl}/documents`);
  }

  telechargerDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/${documentId}/telechargement`, {
      responseType: 'blob'
    });
  }
}
