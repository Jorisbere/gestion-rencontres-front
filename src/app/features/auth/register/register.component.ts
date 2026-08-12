import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

/** Auto-inscription "Créer compte" (cas d'usage acteur Agent, validé le 2026-08-11). */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);
  readonly succes = signal(false);

  readonly formulaire = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required]
  });

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    const v = this.formulaire.getRawValue();
    if (v.motDePasse !== v.confirmation) {
      this.messageErreur.set('La confirmation ne correspond pas au mot de passe.');
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    this.authService.inscrire({ email: v.email!, motDePasse: v.motDePasse! }).subscribe({
      next: () => {
        this.enCours.set(false);
        this.succes.set(true);
        setTimeout(() => this.router.navigate(['/connexion']), 2000);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        this.messageErreur.set(erreur.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }
}
