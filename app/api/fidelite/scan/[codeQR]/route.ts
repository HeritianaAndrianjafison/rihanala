import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getConfig } from "@/lib/fidelite";

export async function GET(_: Request, { params }: { params: Promise<{ codeQR: string }> }) {
  const { codeQR } = await params;

  try {
    const carte = await prisma.carteQR.findUnique({
      where: { codeQR },
      include: {
        client: {
          include: {
            transactions: { orderBy: { createdAt: "desc" }, take: 10 },
            conversions:  { orderBy: { createdAt: "desc" }, take: 5 },
          },
        },
      },
    });

    if (!carte) return NextResponse.json({ error: "QR Code inconnu" }, { status: 404 });
    if (!carte.estActif) return NextResponse.json({ error: "Carte désactivée" }, { status: 403 });

    const config = await getConfig();

    if (!carte.client) {
      return NextResponse.json({ vierge: true, carteId: carte.id, config });
    }
    return NextResponse.json({ vierge: false, client: carte.client, config });
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}
