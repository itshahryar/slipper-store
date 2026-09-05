import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const categoryId = searchParams.get("categoryId") || undefined;
    const subCategoryId = searchParams.get("subCategoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    // Build where clause
    const where: any = {};

    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    } else if (categoryId) {
      where.subCategory = { categoryId };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute paginated queries in transaction
    const [totalCount, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          subCategory: {
            include: { category: true },
          },
          variants: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      products,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error: any) {
    console.error("Admin products API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin products" },
      { status: 500 }
    );
  }
}
