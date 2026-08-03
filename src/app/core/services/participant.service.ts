import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Participant, ParticipantRequest } from '../models/participant.model';

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/participants`;

  lister(): Observable<Participant[]> {
    return this.http.get<Participant[]>(this.baseUrl);
  }

  creer(dto: ParticipantRequest): Observable<Participant> {
    return this.http.post<Participant>(this.baseUrl, dto);
  }
}