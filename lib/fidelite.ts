import { prisma } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TransactionResult {
  pointsGagnes:          number;
  palierAtteint:         boolean;
  nombreConversions:     number;
  montantTotalCredite:   number;
  nouveauxPointsActuels: number;
  nouvelleCagnotte:      number;
}

export interface CagnotteResult {
  success:         boolean;
  error?:          string;
  nouvelleCagnotte?: number;
}

// ── Config ─────────────────────────────────────────────────────────────────────

export async function getConfig() {
  let config = await prisma.fideliteConfig.findUnique({
    where: { id: "config_fidelite" },
  });
  if (!config) {
    config = await prisma.fideliteConfig.create({
      data: { id: "config_fidelite" },
    });
  }
  return config;
}

// ── Algorithme 1 : Enregistrement d'une transaction + attribution des points ──
//
// → floor(montantDepense / valeurPoint) points gagnés
// → Déclenche verifierEtConvertir si palier atteint

export async function enregistrerTransaction(
  clientId: string,
  montantDepense: number,
  categorie?: string,
  note?: string
): Promise<TransactionResult> {
  const config = await getConfig();
  const pointsGagnes = Math.floor(montantDepense / config.valeurPoint);

  return prisma.$transaction(async (tx) => {
    await tx.transactionFidelite.create({
      data: { clientId, montantDepense, pointsGagnes, categorie: categorie ?? null, note: note ?? null },
    });

    const client = await tx.clientFidelite.update({
      where: { id: clientId },
      data: {
        pointsActuels: { increment: pointsGagnes },
        pointsCumules: { increment: pointsGagnes },
      },
    });

    return verifierEtConvertir(tx, client, config, pointsGagnes);
  });
}

// ── Algorithme 2 : Vérification et conversion des paliers ──────────────────────
//
// → while pointsActuels >= seuilConversion : convertir (gère les paliers multiples)
// → Déduit seuilConversion des pointsActuels, crédite valeurRecompense en cagnotte

async function verifierEtConvertir(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  client: { id: string; pointsActuels: number; cagnotte: number },
  config: { seuilConversion: number; valeurRecompense: number },
  pointsGagnes: number
): Promise<TransactionResult> {
  let pointsActuels = client.pointsActuels;
  let cagnotte      = client.cagnotte;
  let conversions   = 0;

  while (pointsActuels >= config.seuilConversion) {
    pointsActuels -= config.seuilConversion;
    cagnotte      += config.valeurRecompense;
    conversions   += 1;

    await tx.conversionPalier.create({
      data: {
        clientId:       client.id,
        pointsUtilises: config.seuilConversion,
        montantCredite: config.valeurRecompense,
      },
    });
  }

  if (conversions > 0) {
    await tx.clientFidelite.update({
      where: { id: client.id },
      data:  { pointsActuels, cagnotte },
    });
  }

  return {
    pointsGagnes,
    palierAtteint:         conversions > 0,
    nombreConversions:     conversions,
    montantTotalCredite:   conversions * config.valeurRecompense,
    nouveauxPointsActuels: pointsActuels,
    nouvelleCagnotte:      cagnotte,
  };
}

// ── Algorithme 3 : Validation et utilisation de la cagnotte ───────────────────
//
// Vérifie : cagnotte >= seuilMinUtilisation ET montant <= cagnotte disponible
// → Déduit montantAUtiliser et enregistre l'utilisation

export async function utiliserCagnotte(
  clientId: string,
  montantAUtiliser: number,
  description?: string
): Promise<CagnotteResult> {
  try {
    const client = await prisma.clientFidelite.findUnique({ where: { id: clientId } });

    if (!client) return { success: false, error: "Client introuvable" };

    if (client.cagnotte <= 0) {
      return { success: false, error: "Ce client n'a pas de cagnotte disponible" };
    }

    if (montantAUtiliser > client.cagnotte) {
      return {
        success: false,
        error: `Montant demandé (${montantAUtiliser.toLocaleString("fr-FR")} Ar) supérieur au solde disponible (${client.cagnotte.toLocaleString("fr-FR")} Ar)`,
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.utilisationCagnotte.create({
        data: { clientId, montantUtilise: montantAUtiliser, description: description ?? null },
      });
      return tx.clientFidelite.update({
        where: { id: clientId },
        data:  { cagnotte: { decrement: montantAUtiliser } },
      });
    });

    return { success: true, nouvelleCagnotte: updated.cagnotte };
  } catch {
    return { success: false, error: "Erreur base de données" };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatAr(montant: number): string {
  return `${Math.round(montant).toLocaleString("fr-FR")} Ar`;
}

export function progressionPalier(pointsActuels: number, seuilConversion: number): number {
  return Math.min((pointsActuels / seuilConversion) * 100, 100);
}
