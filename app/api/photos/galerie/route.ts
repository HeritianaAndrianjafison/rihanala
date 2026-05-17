import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const photoSchema = z.object({
  url:     z.string().url(),
  altFr:   z.string().min(1),
  altEn:   z.string().min(1),
  categorie: z.enum(["HEBERGEMENT", "RESTAURANT", "SALLE_REUNION", "EXTERIEURS", "ACTIVITES", "ACTUALITE"]).optional(),
  ordre:   z.number().int().optional(),
});

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      where: {
        hebergementId: null,
        actualiteId:   null,
        categorie: { in: ["HEBERGEMENT", "RESTAURANT", "EXTERIEURS", "ACTIVITES", "SALLE_REUNION"] },
      },
      orderBy: { ordre: "asc" },
    });
    return NextResponse.json(photos);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = photoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const photo = await prisma.photo.create({
      data: {
        url:       parsed.data.url,
        altFr:     parsed.data.altFr,
        altEn:     parsed.data.altEn,
        categorie: parsed.data.categorie ?? "EXTERIEURS",
        ordre:     parsed.data.ordre ?? 0,
      },
    });
    return NextResponse.json(photo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  try {
    await prisma.photo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
