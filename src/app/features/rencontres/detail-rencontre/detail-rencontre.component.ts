import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RencontreService } from '../../../core/services/rencontre.service';
import { InscriptionService } from '../../../core/services/inscription.service';
import { InviteService } from '../../../core/services/invite.service';
import { AgentService } from '../../../core/services/agent.service';
import { DocumentService } from '../../../core/services/document.service';
import { CourrierService } from '../../../core/services/courrier.service';
import { EtatPeriodiqueService, TypeEtat } from '../../../core/services/etat-periodique.service';
import { AuthService } from '../../../core/services/auth.service';
import { Rencontre, StatutRencontre } from '../../../core/models/rencontre.model';
import { Inscription, StatutPresence } from '../../../core/models/inscription.model';
import { Invite } from '../../../core/models/invite.model';
import { Agent } from '../../../core/models/agent.model';
import { DocumentRencontre, TypeDocument } from '../../../core/models/document.model';
import { Courrier, CourrierRequest, SensCourrier, StatutCourrier } from '../../../core/models/courrier.model';

const TRANSITIONS_AUTORISEES: Record<StatutRencontre, StatutRencontre[]> = {
  PLANIFIEE: ['CONFIRMEE', 'ANNULEE'],
  CONFIRMEE: ['EN_COURS', 'ANNULEE'],
  EN_COURS: ['TERMINEE'],
  TERMINEE: [],
  ANNULEE: []
};

const LIBELLES_ACTION: Record<StatutRencontre, string> = {
  PLANIFIEE: 'Replanifier',
  CONFIRMEE: 'Confirmer',
  EN_COURS: 'Démarrer',
  TERMINEE: 'Terminer',
  ANNULEE: 'Annuler'
};

/** Reflète exactement InscriptionService.validerTransition() côté backend. */
const TRANSITIONS_PRESENCE: Record<StatutPresence, StatutPresence[]> = {
  INSCRIT: ['CONFIRME', 'PRESENT', 'ANNULE'],
  CONFIRME: ['PRESENT', 'ABSENT', 'ANNULE'],
  PRESENT: [],
  ABSENT: [],
  ANNULE: []
};

/** Reflète exactement CourrierService.validerTransition() côté backend — séquentiel, irréversible. */
const TRANSITION_SUIVANTE_COURRIER: Record<StatutCourrier, StatutCourrier | null> = {
  RECU: 'EN_TRAITEMENT',
  EN_TRAITEMENT: 'TRAITE',
  TRAITE: 'ARCHIVE',
  ARCHIVE: null
};

@Component({
  selector: 'app-detail-rencontre',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ConfirmPopupModule],
  templateUrl: './detail-rencontre.component.html',
  styleUrl: './detail-rencontre.component.scss'
})
export class DetailRencontreComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly rencontreService = inject(RencontreService);
  private readonly inscriptionService = inject(InscriptionService);
  private readonly inviteService = inject(InviteService);
  private readonly agentService = inject(AgentService);
  private readonly documentService = inject(DocumentService);
  private readonly courrierService = inject(CourrierService);
  private readonly etatPeriodiqueService = inject(EtatPeriodiqueService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  readonly authService = inject(AuthService);

  readonly rencontre = signal<Rencontre | null>(null);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);
  readonly enCoursTransition = signal(false);

  readonly inscriptions = signal<Inscription[]>([]);
  readonly invites = signal<Invite[]>([]);
  readonly inviteSelectionne = signal<string>('');
  readonly agents = signal<Agent[]>([]);
  readonly agentSelectionne = signal<string>('');
  readonly erreurInscription = signal<string | null>(null);
  readonly inscriptionEnCours = signal(false);

  readonly documents = signal<DocumentRencontre[]>([]);
  readonly typeDocumentSelectionne = signal<TypeDocument | ''>('');
  readonly fichierSelectionne = signal<File | null>(null);
  readonly erreurDocument = signal<string | null>(null);
  readonly depotEnCours = signal(false);
  readonly typesDocumentDisponibles: TypeDocument[] = [
    'ORDRE_DU_JOUR', 'SUPPORT', 'COMPTE_RENDU', 'CONVOCATION', 'AUTRE'
  ];

  readonly courriers = signal<Courrier[]>([]);
  readonly erreurCourrier = signal<string | null>(null);
  readonly creationCourrierEnCours = signal(false);

  readonly formulaireCourrier = this.fb.group({
    sens: ['' as SensCourrier | '', Validators.required],
    objet: ['', Validators.required],
    expediteur: [''],
    destinataire: ['']
  });

  private rencontreId = 0;

  ngOnInit(): void {
    this.rencontreId = Number(this.route.snapshot.paramMap.get('id'));
    this.charger();
    this.chargerInscriptions();
    this.chargerDocuments();
    this.chargerCourriers();
    this.chargerInvites();
    this.chargerAgents();
  }

  /** Exclut les invités déjà liés à un Agent : celui-ci se sélectionne toujours via "Agent ASN". */
  private chargerInvites(): void {
    this.inviteService.lister(true, true).subscribe({
      next: (donnees) => this.invites.set(donnees)
    });
  }

  private chargerAgents(): void {
    this.agentService.lister(true).subscribe({
      next: (donnees) => this.agents.set(donnees)
    });
  }

  charger(): void {
    this.chargement.set(true);
    this.rencontreService.getDetail(this.rencontreId).subscribe({
      next: (donnees) => {
        this.rencontre.set(donnees);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Rencontre introuvable.');
        this.chargement.set(false);
      }
    });
  }

  chargerInscriptions(): void {
    this.inscriptionService.lister(this.rencontreId).subscribe({
      next: (donnees) => this.inscriptions.set(donnees)
    });
  }

  // ---- Statut de la rencontre ----

  transitionsDisponibles(): StatutRencontre[] {
    const actuelle = this.rencontre();
    return actuelle ? TRANSITIONS_AUTORISEES[actuelle.statut] : [];
  }

  libelleAction(statut: StatutRencontre): string {
    return LIBELLES_ACTION[statut];
  }

  demanderConfirmationStatut(evenement: Event, nouveauStatut: StatutRencontre): void {
    if (nouveauStatut !== 'ANNULEE') {
      this.changerStatut(nouveauStatut);
      return;
    }
    this.confirmationService.confirm({
      target: evenement.target as EventTarget,
      message: 'Annuler définitivement cette rencontre ? Cette action ne peut pas être défaite.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Annuler la rencontre',
      rejectLabel: 'Retour',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => this.changerStatut(nouveauStatut)
    });
  }

  private changerStatut(nouveauStatut: StatutRencontre): void {
    this.enCoursTransition.set(true);
    this.erreur.set(null);
    this.rencontreService.changerStatut(this.rencontreId, nouveauStatut).subscribe({
      next: (miseAJour) => {
        this.rencontre.set(miseAJour);
        this.enCoursTransition.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Statut mis à jour',
          detail: `Rencontre : ${LIBELLES_ACTION[nouveauStatut]}`
        });
      },
      error: () => {
        this.erreur.set('Impossible de changer le statut.');
        this.enCoursTransition.set(false);
      }
    });
  }

  classeStatut(statut: StatutRencontre): string {
    switch (statut) {
      case 'PLANIFIEE': return 'pastille-info';
      case 'CONFIRMEE': return 'pastille-succes';
      case 'EN_COURS': return 'pastille-avert';
      case 'TERMINEE': return 'pastille-neutre';
      case 'ANNULEE': return 'pastille-danger';
    }
  }

  // ---- Inscriptions ----

  peutGererPresence(): boolean {
    return this.authService.aLeRole('ADMINISTRATEUR', 'SECRETARIAT');
  }

  inscrireInvite(): void {
    const id = Number(this.inviteSelectionne());
    if (!id) return;

    this.inscriptionEnCours.set(true);
    this.erreurInscription.set(null);

    this.inscriptionService.inscrire(this.rencontreId, id).subscribe({
      next: () => {
        this.inscriptionEnCours.set(false);
        this.inviteSelectionne.set('');
        this.messageService.add({ severity: 'success', summary: 'Invité inscrit', detail: 'Ajouté à la rencontre' });
        this.chargerInscriptions();
      },
      error: (erreur) => {
        this.inscriptionEnCours.set(false);
        this.erreurInscription.set(erreur.error?.message ?? "Impossible d'inscrire cet invité.");
      }
    });
  }

  /**
   * Inscrit directement un Agent ASN : le backend crée ou réutilise automatiquement la
   * fiche Invité liée. Un agent reste toujours sélectionnable ici (liste stable, non
   * filtrée) — le sélecteur "Invité" exclut en retour les invités déjà liés à un agent.
   */
  inscrireAgent(): void {
    const id = Number(this.agentSelectionne());
    if (!id) return;

    this.inscriptionEnCours.set(true);
    this.erreurInscription.set(null);

    this.inscriptionService.inscrireAgent(this.rencontreId, id).subscribe({
      next: () => {
        this.inscriptionEnCours.set(false);
        this.agentSelectionne.set('');
        this.messageService.add({ severity: 'success', summary: 'Agent inscrit', detail: 'Ajouté à la rencontre' });
        this.chargerInscriptions();
      },
      error: (erreur) => {
        this.inscriptionEnCours.set(false);
        this.erreurInscription.set(erreur.error?.message ?? "Impossible d'inscrire cet agent.");
      }
    });
  }

  transitionsPresenceDisponibles(inscription: Inscription): StatutPresence[] {
    return TRANSITIONS_PRESENCE[inscription.statutPresence];
  }

  libelleActionPresence(statut: StatutPresence): string {
    switch (statut) {
      case 'CONFIRME': return 'Confirmer';
      case 'PRESENT': return 'Émarger présent';
      case 'ABSENT': return 'Marquer absent';
      case 'ANNULE': return 'Annuler';
      default: return statut;
    }
  }

  changerPresence(inscription: Inscription, statut: StatutPresence): void {
    this.erreurInscription.set(null);
    this.inscriptionService.changerStatutPresence(this.rencontreId, inscription.id, statut).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.libelleActionPresence(statut),
          detail: inscription.participantNomComplet
        });
        this.chargerInscriptions();
      },
      error: (erreur) => {
        this.erreurInscription.set(erreur.error?.message ?? 'Impossible de changer le statut de présence.');
      }
    });
  }

  demanderConfirmationAnnulationInscription(evenement: Event, inscription: Inscription): void {
    this.confirmationService.confirm({
      target: evenement.target as EventTarget,
      message: `Annuler l'inscription de ${inscription.participantNomComplet} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Annuler l\'inscription',
      rejectLabel: 'Retour',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => this.annulerInscription(inscription)
    });
  }

  private annulerInscription(inscription: Inscription): void {
    this.erreurInscription.set(null);
    this.inscriptionService.annuler(this.rencontreId, inscription.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Inscription annulée',
          detail: inscription.participantNomComplet
        });
        this.chargerInscriptions();
      },
      error: () => this.erreurInscription.set("Impossible d'annuler cette inscription.")
    });
  }

  classePresence(statut: StatutPresence): string {
    switch (statut) {
      case 'INSCRIT': return 'pastille-info';
      case 'CONFIRME': return 'pastille-succes';
      case 'PRESENT': return 'pastille-succes';
      case 'ABSENT': return 'pastille-avert';
      case 'ANNULE': return 'pastille-danger';
    }
  }

  // ---- Documents ----

  private readonly TAILLE_MAX_OCTETS = 10 * 1024 * 1024;
  private readonly EXTENSIONS_ACCEPTEES = ['pdf', 'docx', 'xlsx', 'pptx', 'jpg', 'jpeg', 'png'];

  chargerDocuments(): void {
    this.documentService.lister(this.rencontreId).subscribe({
      next: (donnees) => this.documents.set(donnees)
    });
  }

  surSelectionFichier(evenement: Event): void {
    const input = evenement.target as HTMLInputElement;
    const fichier = input.files?.[0] ?? null;
    this.erreurDocument.set(null);

    if (fichier) {
      const extension = fichier.name.split('.').pop()?.toLowerCase() ?? '';
      if (!this.EXTENSIONS_ACCEPTEES.includes(extension)) {
        this.erreurDocument.set(
          `Format non accepté. Formats autorisés : ${this.EXTENSIONS_ACCEPTEES.join(', ')}`
        );
        this.fichierSelectionne.set(null);
        input.value = '';
        return;
      }
      if (fichier.size > this.TAILLE_MAX_OCTETS) {
        this.erreurDocument.set('Le fichier dépasse la taille maximale autorisée (10 Mo)');
        this.fichierSelectionne.set(null);
        input.value = '';
        return;
      }
    }

    this.fichierSelectionne.set(fichier);
  }

  deposerDocument(): void {
    const fichier = this.fichierSelectionne();
    const type = this.typeDocumentSelectionne();
    if (!fichier || !type) return;

    this.depotEnCours.set(true);
    this.erreurDocument.set(null);

    this.documentService.deposer(this.rencontreId, fichier, type).subscribe({
      next: () => {
        this.depotEnCours.set(false);
        this.fichierSelectionne.set(null);
        this.typeDocumentSelectionne.set('');
        this.messageService.add({ severity: 'success', summary: 'Document déposé', detail: fichier.name });
        this.chargerDocuments();
      },
      error: (erreur) => {
        this.depotEnCours.set(false);
        this.erreurDocument.set(erreur.error?.message ?? 'Impossible de déposer ce document.');
      }
    });
  }

  telechargerDocument(document: DocumentRencontre): void {
    this.documentService.telecharger(this.rencontreId, document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const lien = window.document.createElement('a');
        lien.href = url;
        lien.download = document.nomFichier;
        lien.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.erreurDocument.set('Impossible de télécharger ce document.')
    });
  }

  demanderConfirmationSuppressionDocument(evenement: Event, document: DocumentRencontre): void {
    this.confirmationService.confirm({
      target: evenement.target as EventTarget,
      message: `Supprimer définitivement « ${document.nomFichier} » ? Cette action ne peut pas être défaite.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => this.supprimerDocument(document)
    });
  }

  private supprimerDocument(document: DocumentRencontre): void {
    this.documentService.supprimer(this.rencontreId, document.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Document supprimé', detail: document.nomFichier });
        this.chargerDocuments();
      },
      error: () => this.erreurDocument.set('Impossible de supprimer ce document.')
    });
  }

  formaterTaille(octets: number): string {
    if (octets < 1024) return `${octets} o`;
    if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
  }

  // ---- Courrier ----

  peutGererCourrier(): boolean {
    return this.authService.aLeRole('ADMINISTRATEUR', 'SECRETARIAT');
  }

  chargerCourriers(): void {
    this.courrierService.lister(this.rencontreId).subscribe({
      next: (donnees) => this.courriers.set(donnees)
    });
  }

  creerCourrier(): void {
    if (this.formulaireCourrier.invalid) {
      this.formulaireCourrier.markAllAsTouched();
      return;
    }

    this.creationCourrierEnCours.set(true);
    this.erreurCourrier.set(null);

    const valeurs = this.formulaireCourrier.getRawValue();
    const dto: CourrierRequest = {
      sens: valeurs.sens as SensCourrier,
      objet: valeurs.objet!,
      expediteur: valeurs.expediteur || null,
      destinataire: valeurs.destinataire || null,
      dateReceptionEnvoi: null
    };

    this.courrierService.creer(this.rencontreId, dto).subscribe({
      next: (cree) => {
        this.creationCourrierEnCours.set(false);
        this.formulaireCourrier.reset();
        this.messageService.add({ severity: 'success', summary: 'Courrier enregistré', detail: cree.objet });
        this.chargerCourriers();
      },
      error: (erreur) => {
        this.creationCourrierEnCours.set(false);
        this.erreurCourrier.set(erreur.error?.message ?? 'Impossible de créer ce courrier.');
      }
    });
  }

  prochainStatut(courrier: Courrier): StatutCourrier | null {
    return TRANSITION_SUIVANTE_COURRIER[courrier.statut];
  }

  avancerStatut(courrier: Courrier): void {
    const suivant = this.prochainStatut(courrier);
    if (!suivant) return;

    this.erreurCourrier.set(null);
    this.courrierService.changerStatut(this.rencontreId, courrier.id, suivant).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Statut du courrier mis à jour', detail: courrier.objet });
        this.chargerCourriers();
      },
      error: (erreur) => {
        this.erreurCourrier.set(erreur.error?.message ?? 'Impossible de changer le statut.');
      }
    });
  }

  classeCourrier(statut: StatutCourrier): string {
    switch (statut) {
      case 'RECU': return 'pastille-info';
      case 'EN_TRAITEMENT': return 'pastille-avert';
      case 'TRAITE': return 'pastille-succes';
      case 'ARCHIVE': return 'pastille-neutre';
    }
  }

  // ---- États périodiques (EF5) ----

  readonly archiverEtat = signal(false);
  readonly etatEnCours = signal<TypeEtat | null>(null);
  readonly erreurEtat = signal<string | null>(null);

  readonly etatsDisponibles: { type: TypeEtat; libelle: string; icone: string }[] = [
    { type: 'planning', libelle: 'Planning', icone: 'pi-calendar' },
    { type: 'emargement', libelle: "Fiche d'émargement", icone: 'pi-check-square' },
    { type: 'bilan', libelle: 'Bilan', icone: 'pi-chart-bar' },
    { type: 'recapitulatif', libelle: 'Récapitulatif', icone: 'pi-file-pdf' },
  ];

  telechargerEtat(type: TypeEtat): void {
    this.etatEnCours.set(type);
    this.erreurEtat.set(null);

    this.etatPeriodiqueService.genererEtat(this.rencontreId, type, this.archiverEtat()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const lien = window.document.createElement('a');
        lien.href = url;
        lien.download = `${type}_rencontre_${this.rencontreId}.pdf`;
        lien.click();
        window.URL.revokeObjectURL(url);
        this.etatEnCours.set(null);
        if (this.archiverEtat()) {
          this.chargerDocuments();
        }
      },
      error: () => {
        this.etatEnCours.set(null);
        this.erreurEtat.set(`Impossible de générer ce document.`);
      }
    });
  }
}