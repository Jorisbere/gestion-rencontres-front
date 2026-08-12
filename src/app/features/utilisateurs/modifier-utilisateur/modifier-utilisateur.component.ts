import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { RoleUtilisateur } from '../../../core/models/utilisateur.model';

@Component({
  selector: 'app-modifier-utilisateur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './modifier-utilisateur.component.html',
  styleUrl: './modifier-utilisateur.component.scss'
})
export class ModifierUtilisateurComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  private utilisateurId = 0;
  private agentId = 0;
  readonly chargement = signal(true);
  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);
  readonly rolesDisponibles: RoleUtilisateur[] = ['ADMINISTRATEUR', 'ORGANISATEUR', 'SECRETARIAT', 'AGENT'];
  readonly nomAgent = signal('');

  readonly formulaire = this.fb.group({
    role: ['' as RoleUtilisateur | '', Validators.required]
  });

  ngOnInit(): void {
    this.utilisateurId = Number(this.route.snapshot.paramMap.get('id'));
    this.utilisateurService.getDetail(this.utilisateurId).subscribe({
      next: (utilisateur) => {
        this.agentId = utilisateur.agentId;
        this.nomAgent.set(`${utilisateur.prenom} ${utilisateur.nom} (${utilisateur.email})`);
        this.formulaire.patchValue({ role: utilisateur.role });
        this.chargement.set(false);
      },
      error: () => {
        this.messageErreur.set('Impossible de charger cet utilisateur.');
        this.chargement.set(false);
      }
    });
  }

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    const v = this.formulaire.getRawValue();
    // motDePasse vide : le backend ne réinitialise le mot de passe que si non vide/blank
    this.utilisateurService.modifier(this.utilisateurId, {
      agentId: this.agentId,
      motDePasse: '',
      role: v.role as RoleUtilisateur
    }).subscribe({
      next: () => {
        this.enCours.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Utilisateur modifié',
          detail: this.nomAgent()
        });
        this.router.navigate(['/utilisateurs']);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        this.messageErreur.set(erreur.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }
}
