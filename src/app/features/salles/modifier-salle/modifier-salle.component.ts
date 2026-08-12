import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { SalleService } from '../../../core/services/salle.service';

@Component({
  selector: 'app-modifier-salle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './modifier-salle.component.html',
  styleUrl: './modifier-salle.component.scss'
})
export class ModifierSalleComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly salleService = inject(SalleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  private salleId = 0;
  readonly chargement = signal(true);
  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);

  readonly formulaire = this.fb.group({
    nom: ['', Validators.required],
    capacite: [null as number | null, [Validators.required, Validators.min(1)]],
    localisation: ['']
  });

  ngOnInit(): void {
    this.salleId = Number(this.route.snapshot.paramMap.get('id'));
    this.salleService.getDetail(this.salleId).subscribe({
      next: (salle) => {
        this.formulaire.patchValue({
          nom: salle.nom,
          capacite: salle.capacite,
          localisation: salle.localisation
        });
        this.chargement.set(false);
      },
      error: () => {
        this.messageErreur.set('Impossible de charger cette salle.');
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

    const valeurs = this.formulaire.getRawValue();
    this.salleService.modifier(this.salleId, {
      nom: valeurs.nom!,
      capacite: valeurs.capacite!,
      localisation: valeurs.localisation || null
    }).subscribe({
      next: (modifiee) => {
        this.enCours.set(false);
        this.messageService.add({ severity: 'success', summary: 'Salle modifiée', detail: modifiee.nom });
        this.router.navigate(['/salles']);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        this.messageErreur.set(erreur.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }
}