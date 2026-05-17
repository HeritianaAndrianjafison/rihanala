import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const hebergementSchema = z.object({
  nom:           z.string().min(3),
  nomEn:         z.string().min(3),
  type:          z.enum(["CHAMBRE_DOUBLE", "CHAMBRE_FAMILIALE", "SUITE", "DORTOIR"] as const),
  description:   z.string().min(150),
  descriptionEn: z.string().min(50),
  capacite:      z.number().int().min(1),
  superficie:    z.number().optional(),
  prixBase:      z.number().min(0),
  prixWeekend:   z.number().optional(),
  estActif:      z.boolean(),
  estEnVedette:  z.boolean(),
  ordre:         z.number().int().min(0),
});

export async function GET() {
  try {
    const hebergements = await prisma.hebergement.findMany({
      where: { estActif: true },
      orderBy: [{ estEnVedette: "desc" }, { ordre: "asc" }],
      include: { photos: true, equipements: true },
    });
    return NextResponse.json(hebergements);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = hebergementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  const slug = parsed.data.nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  try {
    const hebergement = await prisma.hebergement.create({
      data: { ...parsed.data, slug },
    });
    return NextResponse.json(hebergement, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
