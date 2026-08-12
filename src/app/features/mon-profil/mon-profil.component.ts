import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ProfilService } from '../../core/services/profil.service';
import { AuthService } from '../../core/services/auth.service';
import { Utilisateur } from '../../core/models/utilisateur.model';

const PALETTE_AVATAR = ['#2E6F9E', '#C99A3B', '#2F9E63', '#8E5FB0', '#C0392B', '#16233F'];

function motsDePasseIdentiquesValidator(control: AbstractControl): ValidationErrors | null {
  const nouveau = control.get('nouveauMotDePasse')?.value;
  const confirmation = control.get('confirmation')?.value;
  return nouveau && confirmation && nouveau !== confirmation ? { motsDifferents: true } : null;
}

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './mon-profil.component.html',
  styleUrl: './mon-profil.component.scss'
})
export class MonProfilComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profilService = inject(ProfilService);
  private readonly authService = inject(AuthService);

  readonly utilisateur = signal<Utilisateur | null>(null);
  readonly chargement = signal(true);

  readonly enCoursProfil = signal(false);
  readonly messageErreurProfil = signal<string | null>(null);
  readonly messageSuccesProfil = signal<string | null>(null);

  readonly enCoursMotDePasse = signal(false);
  readonly messageErreurMotDePasse = signal<string | null>(null);
  readonly messageSuccesMotDePasse = signal<string | null>(null);

  readonly formulaireProfil = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required]
  });

  readonly formulaireMotDePasse = this.fb.group({
    ancienMotDePasse: ['', Validators.required],
    nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required]
  }, { validators: motsDePasseIdentiquesValidator });

  ngOnInit(): void {
    this.profilService.getMoi().subscribe({
      next: (u) => {
        this.utilisateur.set(u);
        this.formulaireProfil.patchValue({ nom: u.nom, prenom: u.prenom });
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false)
    });
  }

  initiales(): string {
    const u = this.utilisateur();
    if (!u) return '';
    return `${u.prenom[0] ?? ''}${u.nom[0] ?? ''}`.toUpperCase();
  }

  couleurAvatar(): string {
    const u = this.utilisateur();
    if (!u) return PALETTE_AVATAR[0];
    // Couleur déterministe à partir de l'identifiant : stable d'une session à l'autre,
    // sans nécessiter de stockage ni d'upload de photo côté serveur.
    return PALETTE_AVATAR[u.id % PALETTE_AVATAR.length];
  }

  soumettreProfil(): void {
    if (this.formulaireProfil.invalid) {
      this.formulaireProfil.markAllAsTouched();
      return;
    }

    this.enCoursProfil.set(true);
    this.messageErreurProfil.set(null);
    this.messageSuccesProfil.set(null);

    const valeurs = this.formulaireProfil.getRawValue();
    this.profilService.modifierProfil({ nom: valeurs.nom!, prenom: valeurs.prenom! }).subscribe({
      next: (u) => {
        this.utilisateur.set(u);
        this.enCoursProfil.set(false);
        this.messageSuccesProfil.set('Informations mises à jour avec succès.');
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCoursProfil.set(false);
        this.messageErreurProfil.set(erreur.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }

  soumettreMotDePasse(): void {
    if (this.formulaireMotDePasse.invalid) {
      this.formulaireMotDePasse.markAllAsTouched();
      return;
    }

    this.enCoursMotDePasse.set(true);
    this.messageErreurMotDePasse.set(null);
    this.messageSuccesMotDePasse.set(null);

    const valeurs = this.formulaireMotDePasse.getRawValue();
    this.profilService.changerMotDePasse({
      ancienMotDePasse: valeurs.ancienMotDePasse!,
      nouveauMotDePasse: valeurs.nouveauMotDePasse!,
      confirmation: valeurs.confirmation!
    }).subscribe({
      next: () => {
        this.enCoursMotDePasse.set(false);
        this.messageSuccesMotDePasse.set('Mot de passe modifié avec succès.');
        this.formulaireMotDePasse.reset();
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCoursMotDePasse.set(false);
        this.messageErreurMotDePasse.set(erreur.error?.message ?? "L'ancien mot de passe est incorrect.");
      }
    });
  }
}