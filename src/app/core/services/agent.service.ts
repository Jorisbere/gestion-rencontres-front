import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Agent, AgentRequest } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/agents`;

  lister(actif?: boolean): Observable<Agent[]> {
    const url = actif === undefined ? this.baseUrl : `${this.baseUrl}?actif=${actif}`;
    return this.http.get<Agent[]>(url);
  }

  /** Agents sans compte applicatif — pour le sélecteur du formulaire "Créer un utilisateur". */
  listerSansCompte(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${this.baseUrl}/sans-compte`);
  }

  getDetail(id: number): Observable<Agent> {
    return this.http.get<Agent>(`${this.baseUrl}/${id}`);
  }

  creer(dto: AgentRequest): Observable<Agent> {
    return this.http.post<Agent>(this.baseUrl, dto);
  }

  modifier(id: number, dto: AgentRequest): Observable<Agent> {
    return this.http.put<Agent>(`${this.baseUrl}/${id}`, dto);
  }

  toggleStatut(id: number, actif: boolean): Observable<Agent> {
    return this.http.patch<Agent>(`${this.baseUrl}/${id}/statut?actif=${actif}`, {});
  }
}
