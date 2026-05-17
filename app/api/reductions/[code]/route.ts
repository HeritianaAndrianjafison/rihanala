import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ code: string }>;
}

function normalizeCode(raw: string): string {
  return raw.trim().replace(/[\s\-]/g, "").toUpperCase();
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { code: rawCode } = await params;
    const code = normalizeCode(rawCode);

    const carte = await prisma.carteReduction.findUnique({ where: { code } });
    if (!carte) {
      return NextResponse.json({ error: "Code invalide" }, { status: 404 });
    }
    if (carte.estUtilise) {
      return NextResponse.json({ error: "Ce code a déjà été utilisé", carte }, { status: 409 });
    }

    return NextResponse.json(carte);
  } catch {
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }
}
