import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEMO_MODE } from "@/config/demo";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "countries") {
      if (DEMO_MODE) {
        return NextResponse.json([
          { id: "demo-uae", name: "United Arab Emirates", code: "AE" },
          { id: "demo-ksa", name: "Saudi Arabia", code: "SA" },
          { id: "demo-qatar", name: "Qatar", code: "QA" },
          { id: "demo-malaysia", name: "Malaysia", code: "MY" },
          { id: "demo-romania", name: "Romania", code: "RO" },
        ]);
      }
      const countries = await prisma.country.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(countries);
    }

    if (type === "industries") {
      if (DEMO_MODE) {
        return NextResponse.json([
          { id: "demo-security", name: "Security Services" },
          { id: "demo-construction", name: "Construction" },
          { id: "demo-hospitality", name: "Hospitality" },
        ]);
      }
      const industries = await prisma.industry.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(industries);
    }

    return NextResponse.json({ error: "Unknown lookup type" }, { status: 400 });
  } catch (error: any) {
    console.error("Lookups API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch lookup data" },
      { status: 500 }
    );
  }
}
