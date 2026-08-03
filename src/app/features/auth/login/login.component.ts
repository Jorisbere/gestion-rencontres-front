import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly formulaire = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required]
  });

  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    this.authService.connecter(this.formulaire.getRawValue() as { email: string; motDePasse: string }).subscribe({
      next: () => {
        this.enCours.set(false);
        this.router.navigate(['/tableau-de-bord']);
      },
      error: () => {
        this.enCours.set(false);
        this.messageErreur.set('Email ou mot de passe incorrect.');
      }
    });
  }
}