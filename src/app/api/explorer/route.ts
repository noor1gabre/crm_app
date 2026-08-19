import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").trim();

  const companies = await prisma.company.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { industry: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      _count: {
        select: { contacts: true, deals: true }
      }
    },
  });

  return NextResponse.json({ companies });
}
