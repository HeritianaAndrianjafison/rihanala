import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const hotelSchema = z.object({
  nom:             z.string().min(2),
  slug:            z.string().min(2),
  description:     z.string().min(10),
  adresse:         z.string().optional(),
  telephone:       z.string().optional(),
  email:           z.string().email().optional().or(z.literal("")),
  siteWeb:         z.string().url().optional().or(z.literal("")),
  facebook:        z.string().optional(),
  instagram:       z.string().optional(),
  latitude:        z.number().optional().nullable(),
  longitude:       z.number().optional().nullable(),
  photoCouverture: z.string().optional(),
  photos:          z.array(z.string()).optional(),
  estActif:        z.boolean().optional(),
  ordre:           z.number().int().optional(),
});

export async function GET() {
  try {
    const hotels = await prisma.hotelAHF.findMany({
      where: { estActif: true },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
    });
    return NextResponse.json(hotels);
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
  const parsed = hotelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const hotel = await prisma.hotelAHF.create({
      data: {
        ...parsed.data,
        email:   parsed.data.email   || null,
        siteWeb: parsed.data.siteWeb || null,
        photos:  parsed.data.photos  ?? [],
      },
    });
    return NextResponse.json(hotel, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
