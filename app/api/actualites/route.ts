import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const actualites = await prisma.actualite.findMany({
      orderBy: [{ estPublie: "asc" }, { publieLe: "desc" }],
      include: { auteur: { select: { nom: true } } },
    });
    return NextResponse.json(actualites);
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
  if (!body) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email: session.user.email! },
    });
    if (!utilisateur) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const actualite = await prisma.actualite.create({
      data: {
        slug: body.slug,
        titre: body.titre,
        titreEn: body.titreEn ?? body.titre,
        resume: body.resume,
        resumeEn: body.resumeEn ?? body.resume,
        contenu: body.contenu ?? "",
        contenuEn: body.contenuEn ?? "",
        imageUrl: body.imageUrl ?? null,
        imageAlt: body.imageAlt ?? null,
        estPublie: body.estPublie ?? false,
        estEnVedette: body.estEnVedette ?? false,
        tags: body.tags ?? [],
        publieLe: body.publieLe ? new Date(body.publieLe) : new Date(),
        auteurId: utilisateur.id,
      },
    });
    return NextResponse.json(actualite, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
