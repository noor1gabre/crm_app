import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalCompanies,
    totalContacts,
    totalDeals,
    dealsByStage,
    recentActivities,
    pipelineValue,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.contact.count(),
    prisma.deal.count(),
    prisma.deal.groupBy({ by: ["stage"], _count: { _all: true }, _sum: { amount: true } }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { deal: { select: { title: true } }, contact: { select: { firstName: true, lastName: true } } },
    }),
    prisma.deal.aggregate({ _sum: { amount: true }, where: { stage: { notIn: ["lost"] } } }),
  ]);

  return NextResponse.json({
    totalCompanies,
    totalContacts,
    totalDeals,
    dealsByStage,
    recentActivities,
    pipelineValue: Number(pipelineValue._sum.amount ?? 0),
  });
}
