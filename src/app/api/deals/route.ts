import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const search = (searchParams.get("q") ?? "").trim();
  const stage  = searchParams.get("stage") ?? "";
  const skip   = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (stage)  where.stage = stage;

  const [rows, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        company: { select: { name: true } },
        contact: { select: { firstName: true, lastName: true } },
        activities: { orderBy: { activityDate: "desc" }, take: 3 },
      },
    }),
    prisma.deal.count({ where }),
  ]);

  return NextResponse.json({ rows, total, page, limit });
}
