import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RencontreService } from '../../../core/services/rencontre.service';
import { SalleService } from '../../../core/services/salle.service';
import { Salle } from '../../../core/models/salle.model';
import { RencontreRequest, TypeRencontre } from '../../../core/models/rencontre.model';

@Component({
  selector: 'app-planifier-rencontre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './planifier-rencontre.component.html',
  styleUrl: './planifier-rencontre.component.scss'
})
export class PlanifierRencontreComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rencontreService = inject(RencontreService);
  private readonly salleService = inject(SalleService);
  private readonly router = inject(Router);

  readonly typesDisponibles: TypeRencontre[] = ['FORMATION', 'REUNION', 'SEMINAIRE', 'ATELIER'];
  readonly salles = signal<Salle[]>([]);
  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);

  readonly formulaire = this.fb.group({
    titre: ['', Validators.required],
    typeRencontre: ['', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required],
    salleId: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.salleService.lister(true).subscribe({
      next: (donnees) => this.salles.set(donnees)
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
    const dto: RencontreRequest = {
      titre: valeurs.titre!,
      typeRencontre: valeurs.typeRencontre as TypeRencontre,
      dateDebut: valeurs.dateDebut!,
      dateFin: valeurs.dateFin!,
      salleId: Number(valeurs.salleId),
      description: valeurs.description || null
    };

    this.rencontreService.creer(dto).subscribe({
      next: () => {
        this.enCours.set(false);
        this.router.navigate(['/rencontres']);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        if (erreur.status === 409) {
          this.messageErreur.set('Cette salle est déjà réservée sur ce créneau. Choisissez un autre horaire ou une autre salle.');
        } else if (erreur.status === 422) {
          this.messageErreur.set(erreur.error?.message ?? 'Données invalides.');
        } else {
          this.messageErreur.set('Une erreur est survenue lors de la création de la rencontre.');
        }
      }
    });
  }
}