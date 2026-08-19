import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const resolvedParams = await params;
  const companyId = parseInt(resolvedParams.companyId, 10);
  if (isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  const details = await prisma.company.findUnique({
    where: { companyId },
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

  if (!details) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json(details);
}
