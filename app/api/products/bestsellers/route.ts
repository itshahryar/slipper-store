import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bestsellers = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        subCategory: {
          include: { category: true },
        },
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bestsellers);
  } catch (error) {
    console.error("Failed to fetch bestsellers:", error);
    return NextResponse.json({ error: "Failed to fetch bestsellers" }, { status: 500 });
  }
}
