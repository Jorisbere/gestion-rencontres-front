export type TypeParticipant = 'PHYSIQUE' | 'STRUCTURE';

export interface InviteRequest {
  typeParticipant: TypeParticipant;
  email: string;
  contact: string | null;
  agentId: number | null;

  // ---- PersonnePhysique ----
  nom: string | null;
  prenom: string | null;
  fonction: string | null;
  structureAffiliation: string | null;

  // ---- Structure ----
  nomStructure: string | null;
  secteurActivite: string | null;
  contactPrincipal: string | null;
}

export interface Invite {
  id: number;
  typeParticipant: TypeParticipant;
  libelle: string;
  email: string;
  contact: string | null;
  actif: boolean;
  agentId: number | null;

  nom: string | null;
  prenom: string | null;
  fonction: string | null;
  structureAffiliation: string | null;

  nomStructure: string | null;
  secteurActivite: string | null;
  contactPrincipal: string | null;

  dateCreation: string;
}
