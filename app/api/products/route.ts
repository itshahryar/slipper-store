import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12"));
    const sort = searchParams.get("sort") || "newest";

    const whereClause: any = { isActive: true };

    if (slug === "bestsellers") {
      whereClause.isFeatured = true;
    } else if (slug !== "all" && slug) {
      // Check category or subcategory
      const category = await prisma.category.findUnique({ where: { slug } });
      if (category) {
        whereClause.subCategory = { categoryId: category.id };
      } else {
        const subCategory = await prisma.subCategory.findUnique({ where: { slug } });
        if (subCategory) {
          whereClause.subCategoryId = subCategory.id;
        }
      }
    }

    // Sort order
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") {
      orderBy = { basePrice: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { basePrice: "desc" };
    } else if (sort === "name-asc") {
      orderBy = { name: "asc" };
    }

    const [totalCount, products] = await prisma.$transaction([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        include: {
          subCategory: {
            include: { category: true },
          },
          variants: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const hasMore = page * limit < totalCount;

    return NextResponse.json({
      products,
      totalCount,
      page,
      limit,
      hasMore,
    });
  } catch (error: any) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
