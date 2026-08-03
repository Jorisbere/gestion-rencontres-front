import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentRencontre, TypeDocument } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);

  private baseUrl(rencontreId: number): string {
    return `${environment.apiUrl}/rencontres/${rencontreId}/documents`;
  }

  lister(rencontreId: number): Observable<DocumentRencontre[]> {
    return this.http.get<DocumentRencontre[]>(this.baseUrl(rencontreId));
  }

  deposer(rencontreId: number, fichier: File, type: TypeDocument): Observable<DocumentRencontre> {
    const formData = new FormData();
    formData.append('fichier', fichier);
    return this.http.post<DocumentRencontre>(`${this.baseUrl(rencontreId)}?type=${type}`, formData);
  }

  telecharger(rencontreId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl(rencontreId)}/${documentId}/telechargement`, {
      responseType: 'blob'
    });
  }

  supprimer(rencontreId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(rencontreId)}/${documentId}`);
  }
}