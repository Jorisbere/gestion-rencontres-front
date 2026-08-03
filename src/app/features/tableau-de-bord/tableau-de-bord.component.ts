import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Raccourci {
  lien: string;
  icone: string;
  titre: string;
  description: string;
}

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tableau-de-bord.component.html',
  styleUrl: './tableau-de-bord.component.scss'
})
export class TableauDeBordComponent {
  readonly authService = inject(AuthService);

  readonly raccourcis: Raccourci[] = [
    { lien: '/rencontres/planifier', icone: 'pi-calendar-plus', titre: 'Planifier une rencontre', description: 'Créer une nouvelle formation, réunion, séminaire ou atelier' },
    { lien: '/rencontres', icone: 'pi-list', titre: 'Voir les rencontres', description: 'Consulter et filtrer toutes les rencontres planifiées' },
    { lien: '/salles', icone: 'pi-building', titre: 'Gérer les salles', description: 'Consulter la disponibilité et réserver une salle' },
    { lien: '/alertes', icone: 'pi-bell', titre: 'Consulter les alertes', description: 'Conflits de salle, rencontres proches, courrier en retard' },
  ];

  saluation(): string {
    const heure = new Date().getHours();
    if (heure < 12) return 'Bonjour';
    if (heure < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
}