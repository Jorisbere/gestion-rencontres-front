import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { RencontreService } from '../../../core/services/rencontre.service';
import { SalleService } from '../../../core/services/salle.service';
import { Salle } from '../../../core/models/salle.model';
import { TypeRencontre } from '../../../core/models/rencontre.model';

@Component({
  selector: 'app-modifier-rencontre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './modifier-rencontre.component.html',
  styleUrl: './modifier-rencontre.component.scss'
})
export class ModifierRencontreComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rencontreService = inject(RencontreService);
  private readonly salleService = inject(SalleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  rencontreId = 0;
  readonly typesDisponibles: TypeRencontre[] = ['FORMATION', 'REUNION', 'SEMINAIRE', 'ATELIER'];
  readonly salles = signal<Salle[]>([]);
  readonly chargement = signal(true);
  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);
  readonly nonModifiable = signal(false);

  private initiateurId: number | null = null;

  readonly formulaire = this.fb.group({
    titre: ['', Validators.required],
    typeRencontre: ['', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required],
    salleId: ['', Validators.required],
    capacitePrevue: ['', [Validators.required, Validators.min(1)]],
    description: ['']
  });

  ngOnInit(): void {
    this.rencontreId = Number(this.route.snapshot.paramMap.get('id'));

    this.salleService.lister(true).subscribe({ next: (donnees) => this.salles.set(donnees) });

    this.rencontreService.getDetail(this.rencontreId).subscribe({
      next: (r) => {
        if (r.statut === 'TERMINEE' || r.statut === 'ANNULEE') {
          this.nonModifiable.set(true);
          this.chargement.set(false);
          return;
        }
        this.initiateurId = r.initiateurId;
        this.formulaire.patchValue({
          titre: r.titre,
          typeRencontre: r.typeRencontre,
          dateDebut: this.versDatetimeLocal(r.dateDebut),
          dateFin: this.versDatetimeLocal(r.dateFin),
          salleId: String(r.salleId),
          capacitePrevue: String(r.capacitePrevue),
          description: r.description ?? ''
        });
        this.chargement.set(false);
      },
      error: () => {
        this.messageErreur.set('Impossible de charger cette rencontre.');
        this.chargement.set(false);
      }
    });
  }

  private versDatetimeLocal(iso: string): string {
    // "2026-08-10T09:00:00" -> "2026-08-10T09:00" attendu par l'input datetime-local
    return iso.slice(0, 16);
  }

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    const valeurs = this.formulaire.getRawValue();
    this.rencontreService.modifier(this.rencontreId, {
      titre: valeurs.titre!,
      typeRencontre: valeurs.typeRencontre as TypeRencontre,
      dateDebut: valeurs.dateDebut!,
      dateFin: valeurs.dateFin!,
      salleId: Number(valeurs.salleId),
      capacitePrevue: Number(valeurs.capacitePrevue),
      initiateurId: this.initiateurId,
      description: valeurs.description || null
    }).subscribe({
      next: (modifiee) => {
        this.enCours.set(false);
        this.messageService.add({ severity: 'success', summary: 'Rencontre modifiée', detail: modifiee.titre });
        this.router.navigate(['/rencontres', this.rencontreId]);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        if (erreur.status === 409) {
          this.messageErreur.set('Cette salle est déjà réservée sur ce créneau.');
        } else {
          this.messageErreur.set(erreur.error?.message ?? 'Une erreur est survenue.');
        }
      }
    });
  }
}