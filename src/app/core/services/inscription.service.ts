import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inscription, StatutPresence } from '../models/inscription.model';

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private readonly http = inject(HttpClient);

  private baseUrl(rencontreId: number): string {
    return `${environment.apiUrl}/rencontres/${rencontreId}/inscriptions`;
  }

  lister(rencontreId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.baseUrl(rencontreId));
  }

  inscrire(rencontreId: number, participantId: number): Observable<Inscription> {
    return this.http.post<Inscription>(this.baseUrl(rencontreId), { participantId });
  }

  /** Inscrit directement un Agent ASN, sans passer par une fiche Invité créée au préalable. */
  inscrireAgent(rencontreId: number, agentId: number): Observable<Inscription> {
    return this.http.post<Inscription>(`${this.baseUrl(rencontreId)}/agent/${agentId}`, {});
  }

  changerStatutPresence(rencontreId: number, inscriptionId: number, statut: StatutPresence): Observable<Inscription> {
    return this.http.patch<Inscription>(
      `${this.baseUrl(rencontreId)}/${inscriptionId}/presence?statut=${statut}`, {}
    );
  }

  annuler(rencontreId: number, inscriptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(rencontreId)}/${inscriptionId}`);
  }
}