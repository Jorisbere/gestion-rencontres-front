import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';

export interface ColonneFiltrable {
  champ: string;
  libelle: string;
}

interface FiltreActif extends ColonneFiltrable {
  valeur: string;
}

/**
 * Barre de filtres "en chips" au-dessus d'un p-table (option C validée par Joris,
 * remplace les icônes de filtre par colonne dans l'en-tête — trop souvent mal alignées).
 * Le tri reste porté par pSortableColumn/p-sortIcon directement dans l'en-tête du tableau.
 */
@Component({
  selector: 'app-filtres-tableau',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtres-tableau.component.html',
  styleUrl: './filtres-tableau.component.scss'
})
export class FiltresTableauComponent {
  @Input({ required: true }) colonnes: ColonneFiltrable[] = [];
  @Input({ required: true }) table!: Table;

  readonly filtresActifs = signal<FiltreActif[]>([]);
  readonly formulaireOuvert = signal(false);
  readonly champChoisi = signal<string>('');
  readonly valeurSaisie = signal<string>('');

  colonnesDisponibles(): ColonneFiltrable[] {
    const champsActifs = new Set(this.filtresActifs().map((f) => f.champ));
    return this.colonnes.filter((c) => !champsActifs.has(c.champ));
  }

  ouvrirFormulaire(): void {
    this.formulaireOuvert.set(true);
    this.champChoisi.set(this.colonnesDisponibles()[0]?.champ ?? '');
    this.valeurSaisie.set('');
  }

  annuler(): void {
    this.formulaireOuvert.set(false);
  }

  appliquer(): void {
    const champ = this.champChoisi();
    const valeur = this.valeurSaisie().trim();
    const colonne = this.colonnes.find((c) => c.champ === champ);
    if (!champ || !valeur || !colonne) return;

    this.table.filter(valeur, champ, 'contains');
    this.filtresActifs.update((liste) => [...liste, { ...colonne, valeur }]);
    this.formulaireOuvert.set(false);
  }

  retirer(filtre: FiltreActif): void {
    this.table.filter('', filtre.champ, 'contains');
    this.filtresActifs.update((liste) => liste.filter((f) => f.champ !== filtre.champ));
  }

  toutEffacer(): void {
    this.filtresActifs().forEach((f) => this.table.filter('', f.champ, 'contains'));
    this.filtresActifs.set([]);
  }
}
