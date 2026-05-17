import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const client = await prisma.clientFidelite.findUnique({
      where: { id },
      include: {
        cartes:       { where: { estActif: true } },
        transactions: { orderBy: { createdAt: "desc" }, take: 20 },
        conversions:  { orderBy: { createdAt: "desc" }, take: 10 },
        utilisations: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}
