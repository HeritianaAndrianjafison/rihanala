import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ nombre: z.number().int().min(1).max(50).default(1) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  const nombre = parsed.success ? parsed.data.nombre : 1;

  try {
    const cartes = await prisma.$transaction(
      Array.from({ length: nombre }, () => prisma.carteQR.create({ data: {} }))
    );
    return NextResponse.json(cartes, { status: 201 });
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}

export async function GET() {
  try {
    const cartes = await prisma.carteQR.findMany({
      where:   { estActif: true, clientId: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(cartes);
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}
