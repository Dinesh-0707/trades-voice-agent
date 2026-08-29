import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!process.env.DASHBOARD_PASSWORD || key !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.quote.deleteMany();
  await prisma.job.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.technician.deleteMany();

  const [mike, priya] = await Promise.all([
    prisma.technician.create({ data: { name: "Mike R.", available: true } }),
    prisma.technician.create({ data: { name: "Priya S.", available: true } }),
  ]);

  const tom = await prisma.customer.create({
    data: { name: "Tom Bracken", phone: "555-0199", address: "48 Larkspur Rd" },
  });

  await prisma.quote.create({
    data: {
      customerId: tom.id,
      description: "Roof repair — replace damaged flashing and reseal",
      amountCents: 420000,
      status: "SENT",
    },
  });

  return NextResponse.json({
    ok: true,
    technicians: [mike.name, priya.name],
    seededQuoteFor: tom.name,
  });
}
