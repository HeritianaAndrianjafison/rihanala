import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  nom:             z.string().min(2).optional(),
  slug:            z.string().min(2).optional(),
  description:     z.string().min(10).optional(),
  adresse:         z.string().optional().nullable(),
  telephone:       z.string().optional().nullable(),
  email:           z.string().email().optional().nullable().or(z.literal("")),
  siteWeb:         z.string().url().optional().nullable().or(z.literal("")),
  facebook:        z.string().optional().nullable(),
  instagram:       z.string().optional().nullable(),
  latitude:        z.number().optional().nullable(),
  longitude:       z.number().optional().nullable(),
  photoCouverture: z.string().optional().nullable(),
  photos:          z.array(z.string()).optional(),
  estActif:        z.boolean().optional(),
  ordre:           z.number().int().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const hotel = await prisma.hotelAHF.findUnique({ where: { id } });
    if (!hotel) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json(hotel);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const hotel = await prisma.hotelAHF.update({
      where: { id },
      data: {
        ...parsed.data,
        email:   parsed.data.email   === "" ? null : parsed.data.email,
        siteWeb: parsed.data.siteWeb === "" ? null : parsed.data.siteWeb,
      },
    });
    return NextResponse.json(hotel);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.hotelAHF.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
