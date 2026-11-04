import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { AlerteService } from '../../../core/services/alerte.service';
import { Alerte, NiveauAlerte } from '../../../core/models/alerte.model';
import { FiltresTableauComponent, ColonneFiltrable } from '../../../shared/filtres-tableau/filtres-tableau.component';

@Component({
  selector: 'app-liste-alertes',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, FiltresTableauComponent],
  templateUrl: './liste-alertes.component.html',
  styleUrl: './liste-alertes.component.scss'
})
export class ListeAlertesComponent implements OnInit {
  private readonly alerteService = inject(AlerteService);
  private readonly messageService = inject(MessageService);

  readonly alertes = signal<Alerte[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);
  readonly afficherTraitees = signal(false);
  readonly niveauFiltre = signal<NiveauAlerte | ''>('');
  readonly niveauxDisponibles: NiveauAlerte[] = ['CRITIQUE', 'ATTENTION', 'INFO'];
  readonly alertesVisibles = computed(() => {
    const niveau = this.niveauFiltre();
    return niveau ? this.alertes().filter((alerte) => alerte.niveau === niveau) : this.alertes();
  });

  readonly colonnesFiltrables: ColonneFiltrable[] = [
    { champ: 'type', libelle: 'Type' },
    { champ: 'niveau', libelle: 'Niveau' },
    { champ: 'message', libelle: 'Message' }
  ];

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    const filtre = this.afficherTraitees() ? undefined : false;
    this.alerteService.lister(filtre).subscribe({
      next: (donnees) => {
        this.alertes.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les alertes.');
        this.chargement.set(false);
      }
    });
  }

  basculerAffichage(): void {
    this.afficherTraitees.set(!this.afficherTraitees());
    this.charger();
  }

  filtrerParNiveau(niveau: NiveauAlerte | ''): void {
    this.niveauFiltre.set(niveau);
  }

  traiter(alerte: Alerte): void {
    this.alerteService.traiter(alerte.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Alerte traitée', detail: alerte.message });
        this.charger();
      },
      error: () => this.erreur.set("Impossible de marquer cette alerte comme traitée.")
    });
  }

  classeNiveau(niveau: NiveauAlerte): string {
    switch (niveau) {
      case 'INFO': return 'pastille-info';
      case 'ATTENTION': return 'pastille-avert';
      case 'CRITIQUE': return 'pastille-danger';
    }
  }
}