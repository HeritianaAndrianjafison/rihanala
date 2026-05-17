import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const photosSchema = z.object({
  cover: z.string().url().optional().nullable(),
  others: z.array(z.string().url()).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const photos = await prisma.photo.findMany({
      where: { hebergementId: id },
      orderBy: [{ estCouverture: "desc" }, { ordre: "asc" }],
    });
    return NextResponse.json(photos);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = photosSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { cover, others = [] } = parsed.data;

  try {
    // Supprimer toutes les photos existantes de cet hébergement
    await prisma.photo.deleteMany({ where: { hebergementId: id } });

    const toCreate: {
      url: string;
      urlOptimisee: null;
      altFr: string;
      altEn: string;
      estCouverture: boolean;
      ordre: number;
      hebergementId: string;
      categorie: "HEBERGEMENT";
    }[] = [];

    if (cover) {
      toCreate.push({
        url: cover,
        urlOptimisee: null,
        altFr: "Photo de couverture",
        altEn: "Cover photo",
        estCouverture: true,
        ordre: 0,
        hebergementId: id,
        categorie: "HEBERGEMENT",
      });
    }

    others.forEach((url, i) => {
      toCreate.push({
        url,
        urlOptimisee: null,
        altFr: `Photo ${i + 1}`,
        altEn: `Photo ${i + 1}`,
        estCouverture: false,
        ordre: i + 1,
        hebergementId: id,
        categorie: "HEBERGEMENT",
      });
    });

    // Créer chaque photo individuellement (Prisma Neon ne supporte pas createMany)
    const created = [];
    for (const data of toCreate) {
      const photo = await prisma.photo.create({ data });
      created.push(photo);
    }

    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la sauvegarde des photos" }, { status: 500 });
  }
}
