import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AgentService } from '../../../core/services/agent.service';

@Component({
  selector: 'app-creer-agent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './creer-agent.component.html',
  styleUrl: './creer-agent.component.scss'
})
export class CreerAgentComponent {
  private readonly fb = inject(FormBuilder);
  private readonly agentService = inject(AgentService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);

  readonly formulaire = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    fonction: ['']
  });

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    const v = this.formulaire.getRawValue();
    this.agentService.creer({
      nom: v.nom!,
      prenom: v.prenom!,
      email: v.email!,
      telephone: v.telephone || null,
      fonction: v.fonction || null
    }).subscribe({
      next: (cree) => {
        this.enCours.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Agent ajouté',
          detail: `${cree.prenom} ${cree.nom}`
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
