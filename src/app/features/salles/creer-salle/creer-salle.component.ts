import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SalleService } from '../../../core/services/salle.service';

@Component({
  selector: 'app-creer-salle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './creer-salle.component.html',
  styleUrl: './creer-salle.component.scss'
})
export class CreerSalleComponent {
  private readonly fb = inject(FormBuilder);
  private readonly salleService = inject(SalleService);
  private readonly router = inject(Router);

  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);

  readonly formulaire = this.fb.group({
    nom: ['', Validators.required],
    capacite: [null as number | null, [Validators.required, Validators.min(1)]],
    localisation: ['']
  });

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    const valeurs = this.formulaire.getRawValue();
    this.salleService.creer({
      nom: valeurs.nom!,
      capacite: valeurs.capacite!,
      localisation: valeurs.localisation || null
    }).subscribe({
      next: () => {
        this.enCours.set(false);
        this.router.navigate(['/salles']);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        this.messageErreur.set(erreur.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }
}