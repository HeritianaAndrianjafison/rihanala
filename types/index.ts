// ── Enums ─────────────────────────────────────────────────────────────────────

export type Locale = "fr" | "en" | "mg";

export type HebergementType =
  | "CHAMBRE_DOUBLE"
  | "CHAMBRE_FAMILIALE"
  | "SUITE"
  | "DORTOIR";

export type StatutReservation =
  | "EN_ATTENTE"
  | "CONFIRMEE"
  | "ANNULEE"
  | "TERMINEE";

export type PhotoCategorie =
  | "HEBERGEMENT"
  | "RESTAURANT"
  | "SALLE_REUNION"
  | "EXTERIEURS"
  | "ACTIVITES"
  | "ACTUALITE";

export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITEUR";

// ── Modèles ───────────────────────────────────────────────────────────────────

export interface IPhoto {
  id: string;
  url: string;
  urlOptimisee?: string | null;
  altFr: string;
  altEn: string;
  titre?: string | null;
  ordre: number;
  estCouverture: boolean;
  categorie: PhotoCategorie;
  createdAt: Date;
}

export interface IEquipement {
  id: string;
  nom: string;
  icone?: string | null;
}

export interface IHebergement {
  id: string;
  slug: string;
  type: string;
  nom: string;
  nomEn: string;
  description: string;
  descriptionEn: string;
  capacite: number;
  superficie?: number | null;
  prixBase: number;
  prixWeekend?: number | null;
  estActif: boolean;
  estEnVedette: boolean;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
  photos: IPhoto[];
  equipements: IEquipement[];
}

export interface IActualite {
  id: string;
  slug: string;
  titre: string;
  titreEn: string;
  resume: string;
  resumeEn: string;
  contenu: string;
  contenuEn: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  estPublie: boolean;
  estEnVedette: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publieLe: Date;
  auteur: { nom: string };
}

export interface IAvis {
  id: string;
  auteurNom: string;
  auteurPays: string;
  note: number;
  commentaire: string;
  reponse?: string | null;
  estApprouve: boolean;
  createdAt: Date;
}

export interface IOffreSpeciale {
  id: string;
  titre: string;
  titreEn: string;
  description: string;
  reduction: number;
  dateDebut: Date;
  dateFin: Date;
  code?: string | null;
  estActif: boolean;
  createdAt: Date;
}

// ── Formulaires ───────────────────────────────────────────────────────────────

export interface IContactForm {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  typeHebergement?: string;
  nbPersonnes?: number;
  message?: string;
}

export interface IReservationForm extends IContactForm {
  hebergementId: string;
  dateArrivee: Date;
  dateDepart: Date;
  nbAdultes: number;
  nbEnfants: number;
  messageSpecial?: string;
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

export interface INavItem {
  label: string;
  href: string;
}

export interface ISeoMeta {
  title: string;
  description: string;
  path?: string;
  locale?: Locale;
  image?: string;
}
