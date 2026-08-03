import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ParticipantService } from '../../../core/services/participant.service';
import { Participant } from '../../../core/models/participant.model';

@Component({
  selector: 'app-liste-participants',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule],
  templateUrl: './liste-participants.component.html',
  styleUrl: './liste-participants.component.scss'
})
export class ListeParticipantsComponent implements OnInit {
  private readonly participantService = inject(ParticipantService);

  readonly participants = signal<Participant[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.participantService.lister().subscribe({
      next: (donnees) => {
        this.participants.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les participants.');
        this.chargement.set(false);
      }
    });
  }
}