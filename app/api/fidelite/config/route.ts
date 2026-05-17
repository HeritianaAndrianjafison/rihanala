import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getConfig } from "@/lib/fidelite";

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}

const configSchema = z.object({
  estActif:            z.boolean().optional(),
  valeurPoint:         z.number().positive(),
  seuilConversion:     z.number().int().positive(),
  valeurRecompense:    z.number().positive(),
  seuilMinUtilisation: z.number().positive(),
});

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const config = await prisma.fideliteConfig.upsert({
      where:  { id: "config_fidelite" },
      update: parsed.data,
      create: { id: "config_fidelite", ...parsed.data },
    });
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}
