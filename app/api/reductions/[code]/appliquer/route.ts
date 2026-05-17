import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ code: string }>;
}

function normalizeCode(raw: string): string {
  return raw.trim().replace(/[\s\-]/g, "").toUpperCase();
}

const schema = z.object({
  montantOriginal: z.number().positive(),
  note:            z.string().max(200).optional(),
});

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { code: rawCode } = await params;
    const code = normalizeCode(rawCode);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const carte = await prisma.carteReduction.findUnique({ where: { code } });
    if (!carte) {
      return NextResponse.json({ error: "Code invalide" }, { status: 404 });
    }
    if (carte.estUtilise) {
      return NextResponse.json({ error: "Ce code a déjà été utilisé" }, { status: 409 });
    }

    const { montantOriginal, note } = parsed.data;
    const montantFinal = Math.round(montantOriginal * (1 - carte.pourcentage / 100));

    const updated = await prisma.carteReduction.update({
      where: { code },
      data: {
        estUtilise:      true,
        utiliseAt:       new Date(),
        montantOriginal,
        montantFinal,
        note:            note ?? carte.note,
      },
    });

    return NextResponse.json({
      carte:           updated,
      montantOriginal,
      montantFinal,
      economie:        montantOriginal - montantFinal,
      pourcentage:     carte.pourcentage,
    });
  } catch {
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }
}
