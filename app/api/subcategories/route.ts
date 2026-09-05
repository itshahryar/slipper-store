import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const subCategories = await prisma.subCategory.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: "asc" },
    });

    const formatted = subCategories.map((s) => ({
      id: s.id,
      name: s.name,
      categoryName: s.category.name,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
  }
}
