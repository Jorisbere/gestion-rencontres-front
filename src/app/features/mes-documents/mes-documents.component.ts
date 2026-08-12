import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { EspacePersonnelService } from '../../core/services/espace-personnel.service';
import { MesDocument } from '../../core/models/mes-document.model';

@Component({
  selector: 'app-mes-documents',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './mes-documents.component.html',
  styleUrl: './mes-documents.component.scss'
})
export class MesDocumentsComponent implements OnInit {
  private readonly espacePersonnelService = inject(EspacePersonnelService);

  readonly documents = signal<MesDocument[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);
  readonly erreurTelechargement = signal<string | null>(null);

  ngOnInit(): void {
    this.espacePersonnelService.listerDocuments().subscribe({
      next: (donnees) => {
        this.documents.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger tes documents.');
        this.chargement.set(false);
      }
    });
  }

  formaterTaille(octets: number): string {
    if (octets < 1024) return `${octets} o`;
    if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
  }

  telechargerDocument(document: MesDocument): void {
    this.erreurTelechargement.set(null);
    this.espacePersonnelService.telechargerDocument(document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const lien = window.document.createElement('a');
        lien.href = url;
        lien.download = document.nomFichier;
        lien.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.erreurTelechargement.set('Impossible de télécharger ce document.')
    });
  }
}
