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
      contacts: {
        orderBy: { createdAt: "desc" },
        include: {
          activities: { orderBy: { activityDate: "desc" }, take: 5 },
          deals: {
            select: { dealId: true, title: true, stage: true, amount: true },
          },
        },
      },
      deals: {
        orderBy: { updatedAt: "desc" },
        include: {
          contact: { select: { contactId: true, firstName: true, lastName: true } },
          activities: { orderBy: { activityDate: "desc" }, take: 5 },
        },
      },
    },
  });

  return NextResponse.json({ companies });
}
