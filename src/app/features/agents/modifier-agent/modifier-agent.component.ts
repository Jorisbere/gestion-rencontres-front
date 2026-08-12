import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AgentService } from '../../../core/services/agent.service';

@Component({
  selector: 'app-modifier-agent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './modifier-agent.component.html',
  styleUrl: './modifier-agent.component.scss'
})
export class ModifierAgentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly agentService = inject(AgentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  private agentId = 0;
  readonly chargement = signal(true);
  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);

  readonly formulaire = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    fonction: ['']
  });

  ngOnInit(): void {
    this.agentId = Number(this.route.snapshot.paramMap.get('id'));
    this.agentService.getDetail(this.agentId).subscribe({
      next: (agent) => {
        this.formulaire.patchValue({
          nom: agent.nom,
          prenom: agent.prenom,
          email: agent.email,
          telephone: agent.telephone,
          fonction: agent.fonction
        });
        this.chargement.set(false);
      },
      error: () => {
        this.messageErreur.set('Impossible de charger cet agent.');
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

    const v = this.formulaire.getRawValue();
    this.agentService.modifier(this.agentId, {
      nom: v.nom!,
      prenom: v.prenom!,
      email: v.email!,
      telephone: v.telephone || null,
      fonction: v.fonction || null
    }).subscribe({
      next: (modifie) => {
        this.enCours.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Agent modifié',
          detail: `${modifie.prenom} ${modifie.nom}`
        });
        this.router.navigate(['/agents']);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        this.messageErreur.set(erreur.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }
}
