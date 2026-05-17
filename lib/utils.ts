import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "MGA"): string {
  return new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function getHebergementLabel(type: string, locale = "fr"): string {
  const labels: Record<string, Record<string, string>> = {
    fr: {
      CHAMBRE_DOUBLE: "Chambre Double",
      CHAMBRE_FAMILIALE: "Chambre Familiale",
      SUITE: "Suite",
      DORTOIR: "Dortoir",
    },
    en: {
      CHAMBRE_DOUBLE: "Double Room",
      CHAMBRE_FAMILIALE: "Family Room",
      SUITE: "Suite",
      DORTOIR: "Dormitory",
    },
    mg: {
      CHAMBRE_DOUBLE: "Efitrano Roa",
      CHAMBRE_FAMILIALE: "Efitrano Fianakaviana",
      SUITE: "Suite",
      DORTOIR: "Efitrano Be",
    },
  };
  return labels[locale]?.[type] ?? type;
}
