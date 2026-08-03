import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { RoleUtilisateur } from '../../../core/models/utilisateur.model';

@Component({
  selector: 'app-creer-utilisateur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './creer-utilisateur.component.html',
  styleUrl: './creer-utilisateur.component.scss'
})
export class CreerUtilisateurComponent {
  private readonly fb = inject(FormBuilder);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly router = inject(Router);

  readonly rolesDisponibles: RoleUtilisateur[] = ['ADMINISTRATEUR', 'ORGANISATEUR', 'SECRETARIAT'];
  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);

  readonly formulaire = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    role: ['' as RoleUtilisateur | '', Validators.required]
  });

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    const valeurs = this.formulaire.getRawValue();
    this.utilisateurService.creer({
      nom: valeurs.nom!,
      prenom: valeurs.prenom!,
      email: valeurs.email!,
      motDePasse: valeurs.motDePasse!,
      role: valeurs.role as RoleUtilisateur
    }).subscribe({
      next: () => {
        this.enCours.set(false);
        this.router.navigate(['/utilisateurs']);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        this.messageErreur.set(erreur.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }
}