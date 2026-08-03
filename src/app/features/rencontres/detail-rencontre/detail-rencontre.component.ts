import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RencontreService } from '../../../core/services/rencontre.service';
import { InscriptionService } from '../../../core/services/inscription.service';
import { ParticipantService } from '../../../core/services/participant.service';
import { DocumentService } from '../../../core/services/document.service';
import { CourrierService } from '../../../core/services/courrier.service';
import { AuthService } from '../../../core/services/auth.service';
import { Rencontre, StatutRencontre } from '../../../core/models/rencontre.model';
import { Inscription, StatutPresence } from '../../../core/models/inscription.model';
import { Participant } from '../../../core/models/participant.model';
import { DocumentRencontre, TypeDocument } from '../../../core/models/document.model';
import { Courrier, CourrierRequest, HistoriqueStatutCourrier, SensCourrier, StatutCourrier } from '../../../core/models/courrier.model';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './detail-rencontre.component.html',
  styleUrl: './detail-rencontre.component.scss'
})
export class DetailRencontreComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly rencontreService = inject(RencontreService);
  private readonly inscriptionService = inject(InscriptionService);
  private readonly participantService = inject(ParticipantService);
  private readonly documentService = inject(DocumentService);
  private readonly courrierService = inject(CourrierService);
  readonly authService = inject(AuthService);

  readonly rencontre = signal<Rencontre | null>(null);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);
  readonly enCoursTransition = signal(false);

  readonly inscriptions = signal<Inscription[]>([]);
  readonly participants = signal<Participant[]>([]);
  readonly participantSelectionne = signal<string>('');
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
  readonly historiqueOuvert = signal<number | null>(null);
  readonly historique = signal<HistoriqueStatutCourrier[]>([]);

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
    this.participantService.lister().subscribe({
      next: (donnees) => this.participants.set(donnees)
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

  changerStatut(nouveauStatut: StatutRencontre): void {
    this.enCoursTransition.set(true);
    this.erreur.set(null);
    this.rencontreService.changerStatut(this.rencontreId, nouveauStatut).subscribe({
      next: (miseAJour) => {
        this.rencontre.set(miseAJour);
        this.enCoursTransition.set(false);
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

  inscrireParticipant(): void {
    const id = Number(this.participantSelectionne());
    if (!id) return;

    this.inscriptionEnCours.set(true);
    this.erreurInscription.set(null);

    this.inscriptionService.inscrire(this.rencontreId, id).subscribe({
      next: () => {
        this.inscriptionEnCours.set(false);
        this.participantSelectionne.set('');
        this.chargerInscriptions();
      },
      error: (erreur) => {
        this.inscriptionEnCours.set(false);
        this.erreurInscription.set(erreur.error?.message ?? "Impossible d'inscrire ce participant.");
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
      next: () => this.chargerInscriptions(),
      error: (erreur) => {
        this.erreurInscription.set(erreur.error?.message ?? 'Impossible de changer le statut de présence.');
      }
    });
  }

  annulerInscription(inscription: Inscription): void {
    this.erreurInscription.set(null);
    this.inscriptionService.annuler(this.rencontreId, inscription.id).subscribe({
      next: () => this.chargerInscriptions(),
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

  supprimerDocument(document: DocumentRencontre): void {
    this.documentService.supprimer(this.rencontreId, document.id).subscribe({
      next: () => this.chargerDocuments(),
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
      next: () => {
        this.creationCourrierEnCours.set(false);
        this.formulaireCourrier.reset();
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
      next: () => this.chargerCourriers(),
      error: (erreur) => {
        this.erreurCourrier.set(erreur.error?.message ?? 'Impossible de changer le statut.');
      }
    });
  }

  basculerHistorique(courrier: Courrier): void {
    if (this.historiqueOuvert() === courrier.id) {
      this.historiqueOuvert.set(null);
      return;
    }
    this.courrierService.getHistorique(this.rencontreId, courrier.id).subscribe({
      next: (donnees) => {
        this.historique.set(donnees);
        this.historiqueOuvert.set(courrier.id);
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
}