import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const entries = Object.entries(body as Record<string, string>);
    await Promise.all(
      entries.map(async ([cle, valeur]) => {
        const existing = await prisma.parametre.findUnique({ where: { cle } });
        if (existing) {
          return prisma.parametre.update({ where: { cle }, data: { valeur: String(valeur) } });
        }
        return prisma.parametre.create({ data: { cle, valeur: String(valeur), type: "string" } });
      })
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 });
  }
}
