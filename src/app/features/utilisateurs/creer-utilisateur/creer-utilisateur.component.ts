import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { AgentService } from '../../../core/services/agent.service';
import { RoleUtilisateur } from '../../../core/models/utilisateur.model';
import { Agent } from '../../../core/models/agent.model';

@Component({
  selector: 'app-creer-utilisateur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './creer-utilisateur.component.html',
  styleUrl: './creer-utilisateur.component.scss'
})
export class CreerUtilisateurComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly agentService = inject(AgentService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // ADMINISTRATEUR/ORGANISATEUR/SECRETARIAT créés ici par un admin ; AGENT s'obtient
  // par auto-inscription (POST /auth/register), pas via ce formulaire.
  readonly rolesDisponibles: RoleUtilisateur[] = ['ADMINISTRATEUR', 'ORGANISATEUR', 'SECRETARIAT'];
  readonly agentsSansCompte = signal<Agent[]>([]);
  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);

  readonly formulaire = this.fb.group({
    agentId: ['', Validators.required],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    role: ['' as RoleUtilisateur | '', Validators.required]
  });

  ngOnInit(): void {
    this.agentService.listerSansCompte().subscribe({
      next: (donnees) => this.agentsSansCompte.set(donnees)
    });
  }

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    const v = this.formulaire.getRawValue();
    this.utilisateurService.creer({
      agentId: Number(v.agentId),
      motDePasse: v.motDePasse!,
      role: v.role as RoleUtilisateur
    }).subscribe({
      next: (cree) => {
        this.enCours.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Compte utilisateur créé',
          detail: `${cree.prenom} ${cree.nom}`
        });
        this.router.navigate(['/utilisateurs']);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        this.messageErreur.set(erreur.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }
}
