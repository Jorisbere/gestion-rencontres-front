import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { Utilisateur } from '../../../core/models/utilisateur.model';

@Component({
  selector: 'app-liste-utilisateurs',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, TagModule],
  templateUrl: './liste-utilisateurs.component.html',
  styleUrl: './liste-utilisateurs.component.scss'
})
export class ListeUtilisateursComponent implements OnInit {
  private readonly utilisateurService = inject(UtilisateurService);

  readonly utilisateurs = signal<Utilisateur[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.utilisateurService.lister().subscribe({
      next: (donnees) => {
        this.utilisateurs.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les utilisateurs.');
        this.chargement.set(false);
      }
    });
  }

  basculerActivation(utilisateur: Utilisateur): void {
    this.utilisateurService.toggleStatut(utilisateur.id, !utilisateur.actif).subscribe({
      next: () => this.charger(),
      error: () => this.erreur.set("Impossible de modifier le statut de cet utilisateur.")
    });
  }
}