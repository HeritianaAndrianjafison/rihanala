import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function genCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

async function genUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = genCode();
    const exists = await prisma.carteReduction.findUnique({ where: { code } });
    if (!exists) return code;
  }
  throw new Error("Impossible de générer un code unique");
}

const createSchema = z.object({
  nombre:      z.number().int().min(1).max(500),
  pourcentage: z.number().min(0.1).max(100),
  note:        z.string().max(200).optional(),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const estUtilise  = url.searchParams.get("estUtilise");
    const pourcentage = url.searchParams.get("pourcentage");

    const where: Record<string, unknown> = {};
    if (estUtilise === "true")  where.estUtilise = true;
    if (estUtilise === "false") where.estUtilise = false;
    if (pourcentage)            where.pourcentage = parseFloat(pourcentage);

    const cartes = await prisma.carteReduction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    return NextResponse.json(cartes);
  } catch {
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { nombre, pourcentage, note } = parsed.data;

    const codes: string[] = [];
    for (let i = 0; i < nombre; i++) {
      codes.push(await genUniqueCode());
    }

    const cartes = await prisma.carteReduction.createManyAndReturn({
      data: codes.map((code) => ({ code, pourcentage, note: note ?? null })),
    });

    return NextResponse.json(cartes, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    const isTableMissing = msg.includes("cartes_reduction") || msg.includes("does not exist");
    return NextResponse.json(
      { error: isTableMissing
          ? "Table manquante — exécutez le SQL de création dans Neon"
          : "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}
