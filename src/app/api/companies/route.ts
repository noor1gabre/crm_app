import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const search = (searchParams.get("q") ?? "").trim();
  const skip   = (page - 1) * limit;

  const where = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { industry: { contains: search, mode: "insensitive" as const } }] }
    : {};

  const [rows, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { _count: { select: { contacts: true, deals: true } } },
    }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({ rows, total, page, limit });
}
