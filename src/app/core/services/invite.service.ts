import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invite, InviteRequest } from '../models/invite.model';

/** Ex-ParticipantService (EF3, refonte "Invite" — personnes physiques et structures). */
@Injectable({ providedIn: 'root' })
export class InviteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/invites`;

  /**
   * @param sansAgent si vrai, exclut les invités déjà liés à un Agent — un agent ASN se
   *                  sélectionne toujours via le sélecteur "Agent ASN", jamais ici.
   */
  lister(actif?: boolean, sansAgent?: boolean): Observable<Invite[]> {
    const params: string[] = [];
    if (actif !== undefined) params.push(`actif=${actif}`);
    if (sansAgent !== undefined) params.push(`sansAgent=${sansAgent}`);
    const url = params.length ? `${this.baseUrl}?${params.join('&')}` : this.baseUrl;
    return this.http.get<Invite[]>(url);
  }

  getDetail(id: number): Observable<Invite> {
    return this.http.get<Invite>(`${this.baseUrl}/${id}`);
  }

  creer(dto: InviteRequest): Observable<Invite> {
    return this.http.post<Invite>(this.baseUrl, dto);
  }

  modifier(id: number, dto: InviteRequest): Observable<Invite> {
    return this.http.put<Invite>(`${this.baseUrl}/${id}`, dto);
  }

  desactiver(id: number): Observable<Invite> {
    return this.http.patch<Invite>(`${this.baseUrl}/${id}/desactiver`, {});
  }

  activer(id: number): Observable<Invite> {
    return this.http.patch<Invite>(`${this.baseUrl}/${id}/activer`, {});
  }
}
