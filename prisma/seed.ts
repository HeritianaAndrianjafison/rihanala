import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaNeonHttp(url, {});
const prisma = new PrismaClient({ adapter });

async function createHebergement(data: {
  slug: string;
  type: "SUITE" | "CHAMBRE_DOUBLE" | "CHAMBRE_FAMILIALE" | "DORTOIR";
  nom: string;
  nomEn: string;
  description: string;
  descriptionEn: string;
  capacite: number;
  prixBase: number;
  estEnVedette: boolean;
  ordre: number;
  equipements: { nom: string; icone: string }[];
}) {
  const existing = await prisma.hebergement.findUnique({ where: { slug: data.slug } });
  if (existing) return existing;

  const { equipements, ...fields } = data;
  const hebergement = await prisma.hebergement.create({ data: fields });

  for (const eq of equipements) {
    await prisma.equipement.create({
      data: { ...eq, hebergementId: hebergement.id },
    });
  }

  return hebergement;
}

async function main() {
  console.log("🌱 Début du seed...");

  // ── Admin initial ──────────────────────────────────────────────────────────
  const existingAdmin = await prisma.utilisateur.findUnique({
    where: { email: "admin@rihanala-village.mg" },
  });

  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) throw new Error("ADMIN_PASSWORD env var is required for seeding");
    const motDePasse = await bcrypt.hash(adminPassword, 12);
    await prisma.utilisateur.create({
      data: {
        email: "admin@rihanala-village.mg",
        nom: "Administrateur",
        motDePasse,
        role: "SUPER_ADMIN",
      },
    });
  }
  console.log("✅ Admin:", existingAdmin ? "déjà existant" : "créé");

  // ── Hébergements ───────────────────────────────────────────────────────────
  const suite = await createHebergement({
    slug: "suite",
    type: "SUITE",
    nom: "Suite",
    nomEn: "Suite",
    description:
      "Notre hébergement premium. Espace généreux, décoration soignée et équipements haut de gamme pour une expérience inoubliable à Foulpointe.",
    descriptionEn:
      "Our premium accommodation. Generous space, refined décor and high-end amenities for an unforgettable experience in Foulpointe.",
    capacite: 2,
    prixBase: 0,
    estEnVedette: true,
    ordre: 1,
    equipements: [
      { nom: "Climatisation", icone: "Wind" },
      { nom: "Salle de bain privée", icone: "Bath" },
      { nom: "Télévision", icone: "Tv" },
      { nom: "WiFi gratuit", icone: "Wifi" },
    ],
  });

  const chambreDouble = await createHebergement({
    slug: "chambre-double",
    type: "CHAMBRE_DOUBLE",
    nom: "Chambre Double",
    nomEn: "Double Room",
    description:
      "Bungalow tout confort pour 2 personnes, dans un écrin de verdure tropicale. Calme et intimité garantis.",
    descriptionEn:
      "Comfortable bungalow for 2 people, nestled in a tropical green setting. Peace and privacy guaranteed.",
    capacite: 2,
    prixBase: 0,
    estEnVedette: false,
    ordre: 2,
    equipements: [
      { nom: "Climatisation", icone: "Wind" },
      { nom: "Bungalow privé", icone: "Home" },
      { nom: "WiFi gratuit", icone: "Wifi" },
    ],
  });

  const chambreFamiliale = await createHebergement({
    slug: "chambre-familiale",
    type: "CHAMBRE_FAMILIALE",
    nom: "Chambre Familiale",
    nomEn: "Family Room",
    description:
      "Conçue pour les familles en configurations 4, 6, 7 ou 8 personnes. Espace de vie commun et intimité préservée.",
    descriptionEn:
      "Designed for families in 4, 6, 7 or 8 person configurations. Shared living space with preserved privacy.",
    capacite: 8,
    prixBase: 0,
    estEnVedette: false,
    ordre: 3,
    equipements: [
      { nom: "Climatisation", icone: "Wind" },
      { nom: "Salon commun", icone: "Sofa" },
      { nom: "WiFi gratuit", icone: "Wifi" },
    ],
  });

  const dortoir = await createHebergement({
    slug: "dortoir",
    type: "DORTOIR",
    nom: "Dortoir",
    nomEn: "Dormitory",
    description:
      "Idéal pour retraites spirituelles, groupes jeunesse et équipes. Disponible en 10 ou 20 personnes avec cuisine et réfectoire.",
    descriptionEn:
      "Ideal for spiritual retreats, youth groups and teams. Available for 10 or 20 people with kitchen and refectory.",
    capacite: 20,
    prixBase: 0,
    estEnVedette: false,
    ordre: 4,
    equipements: [
      { nom: "Réfectoire inclus", icone: "UtensilsCrossed" },
      { nom: "Cuisine commune", icone: "ChefHat" },
      { nom: "WiFi gratuit", icone: "Wifi" },
    ],
  });

  console.log(
    "✅ Hébergements:",
    suite.nom,
    chambreDouble.nom,
    chambreFamiliale.nom,
    dortoir.nom
  );

  // ── Paramètres globaux ─────────────────────────────────────────────────────
  const parametres = [
    { cle: "telephone", valeur: "+261346808466" },
    { cle: "email_contact", valeur: "contact@rihanala-village.mg" },
    { cle: "facebook_url", valeur: "https://www.facebook.com/RihanalaVillageFoulpointe" },
    {
      cle: "whatsapp_message",
      valeur: "Bonjour Rihanala Village, je souhaite des informations sur vos hébergements.",
    },
  ];

  for (const param of parametres) {
    const existing = await prisma.parametre.findUnique({ where: { cle: param.cle } });
    if (!existing) {
      await prisma.parametre.create({ data: { ...param, type: "string" } });
    }
  }
  console.log("✅ Paramètres configurés");

  console.log("🎉 Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
