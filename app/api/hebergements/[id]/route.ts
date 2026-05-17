import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  nom:           z.string().min(3).optional(),
  nomEn:         z.string().min(3).optional(),
  type:          z.enum(["CHAMBRE_DOUBLE", "CHAMBRE_FAMILIALE", "SUITE", "DORTOIR"]).optional(),
  description:   z.string().min(150).optional(),
  descriptionEn: z.string().min(50).optional(),
  capacite:      z.number().int().min(1).optional(),
  superficie:    z.number().optional().nullable(),
  prixBase:      z.number().min(0).optional(),
  prixWeekend:   z.number().optional().nullable(),
  estActif:      z.boolean().optional(),
  estEnVedette:  z.boolean().optional(),
  ordre:         z.number().int().min(0).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const hebergement = await prisma.hebergement.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(hebergement);
  } catch {
    return NextResponse.json({ error: "Hébergement introuvable ou erreur serveur" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.hebergement.update({
      where: { id },
      data: { estActif: false },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Hébergement introuvable" }, { status: 404 });
  }
}
