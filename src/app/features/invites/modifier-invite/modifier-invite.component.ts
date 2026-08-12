import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { InviteService } from '../../../core/services/invite.service';
import { AgentService } from '../../../core/services/agent.service';
import { InviteRequest, TypeParticipant } from '../../../core/models/invite.model';
import { Agent } from '../../../core/models/agent.model';

@Component({
  selector: 'app-modifier-invite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './modifier-invite.component.html',
  styleUrl: './modifier-invite.component.scss'
})
export class ModifierInviteComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inviteService = inject(InviteService);
  private readonly agentService = inject(AgentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  private inviteId = 0;
  readonly chargement = signal(true);
  readonly enCours = signal(false);
  readonly messageErreur = signal<string | null>(null);
  readonly agents = signal<Agent[]>([]);

  readonly formulaire = this.fb.group({
    typeParticipant: ['PHYSIQUE' as TypeParticipant, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contact: [''],
    agentId: [''],
    nom: [''],
    prenom: [''],
    fonction: [''],
    structureAffiliation: [''],
    nomStructure: [''],
    secteurActivite: [''],
    contactPrincipal: ['']
  });

  estPhysique(): boolean {
    return this.formulaire.get('typeParticipant')?.value === 'PHYSIQUE';
  }

  ngOnInit(): void {
    this.agentService.lister(true).subscribe({
      next: (donnees) => this.agents.set(donnees)
    });

    this.inviteId = Number(this.route.snapshot.paramMap.get('id'));
    this.inviteService.getDetail(this.inviteId).subscribe({
      next: (invite) => {
        this.formulaire.patchValue({
          typeParticipant: invite.typeParticipant,
          email: invite.email,
          contact: invite.contact,
          agentId: invite.agentId ? String(invite.agentId) : '',
          nom: invite.nom,
          prenom: invite.prenom,
          fonction: invite.fonction,
          structureAffiliation: invite.structureAffiliation,
          nomStructure: invite.nomStructure,
          secteurActivite: invite.secteurActivite,
          contactPrincipal: invite.contactPrincipal
        });
        // Le type ne peut pas être changé après création (cf. InviteService côté back) : figé.
        this.formulaire.get('typeParticipant')?.disable();
        this.chargement.set(false);
      },
      error: () => {
        this.messageErreur.set('Impossible de charger cet invité.');
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
    const physique = v.typeParticipant === 'PHYSIQUE';
    const dto: InviteRequest = {
      typeParticipant: v.typeParticipant!,
      email: v.email!,
      contact: v.contact || null,
      agentId: physique && v.agentId ? Number(v.agentId) : null,
      nom: physique ? (v.nom || null) : null,
      prenom: physique ? (v.prenom || null) : null,
      fonction: physique ? (v.fonction || null) : null,
      structureAffiliation: physique ? (v.structureAffiliation || null) : null,
      nomStructure: physique ? null : (v.nomStructure || null),
      secteurActivite: physique ? null : (v.secteurActivite || null),
      contactPrincipal: physique ? null : (v.contactPrincipal || null)
    };

    this.inviteService.modifier(this.inviteId, dto).subscribe({
      next: (modifie) => {
        this.enCours.set(false);
        this.messageService.add({ severity: 'success', summary: 'Invité modifié', detail: modifie.libelle });
        this.router.navigate(['/invites']);
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        this.messageErreur.set(erreur.error?.message ?? 'Une erreur est survenue.');
      }
    });
  }
}
