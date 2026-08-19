"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ---------- COMPANIES ----------

export async function createCompany(formData: FormData) {
  const name = formData.get("name") as string;
  const industry = formData.get("industry") as string;
  const website = formData.get("website") as string;

  await prisma.company.create({
    data: { name, industry: industry || null, website: website || null },
  });

  revalidatePath("/companies");
}

// ---------- CONTACTS ----------

export async function createContact(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const companyId = formData.get("companyId") as string;

  await prisma.contact.create({
    data: {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      companyId: companyId ? parseInt(companyId) : null,
    },
  });

  revalidatePath("/contacts");
}

// ---------- DEALS ----------

export async function createDeal(formData: FormData) {
  const title = formData.get("title") as string;
  const amount = formData.get("amount") as string;
  const companyId = formData.get("companyId") as string;
  const contactId = formData.get("contactId") as string;

  await prisma.deal.create({
    data: {
      title,
      amount: amount ? parseFloat(amount) : null,
      companyId: companyId ? parseInt(companyId) : null,
      contactId: contactId ? parseInt(contactId) : null,
      stage: "prospecting",
    },
  });

  revalidatePath("/deals");
}

// This is the key "update" action - moving a deal through pipeline stages.
// Every call here is a CDC-relevant UPDATE event on the deals table.
export async function updateDealStage(dealId: number, newStage: string) {
  await prisma.deal.update({
    where: { dealId },
    data: { stage: newStage },
  });

  revalidatePath("/deals");
}

export async function deleteDeal(dealId: number) {
  // Delete associated activities first to satisfy foreign key constraints
  await prisma.activity.deleteMany({ where: { dealId } });
  await prisma.deal.delete({ where: { dealId } });
  
  revalidatePath("/deals");
  revalidatePath("/explorer");
}

// ---------- ACTIVITIES ----------

export async function createActivity(formData: FormData) {
  const type = formData.get("type") as string;
  const notes = formData.get("notes") as string;
  const dealId = formData.get("dealId") as string;
  const contactId = formData.get("contactId") as string;

  await prisma.activity.create({
    data: {
      type,
      notes: notes || null,
      dealId: dealId ? parseInt(dealId) : null,
      contactId: contactId ? parseInt(contactId) : null,
    },
  });

  revalidatePath("/deals");
}
