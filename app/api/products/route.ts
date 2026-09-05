import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12"));
    const sort = searchParams.get("sort") || "newest";

    // Dynamic Filter Parameters
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const subCategoriesParam = searchParams.get("subCategories"); // comma-separated slugs/ids
    const inStock = searchParams.get("inStock") === "true";
    const sizeParam = searchParams.get("sizes"); // comma-separated sizes

    const whereClause: any = { isActive: true };

    if (slug === "bestsellers") {
      whereClause.isFeatured = true;
    } else if (slug !== "all" && slug) {
      // Check parent category or subcategory
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

    // Filter by specific subcategories (if provided)
    if (subCategoriesParam) {
      const subCatList = subCategoriesParam.split(",").filter(Boolean);
      if (subCatList.length > 0) {
        whereClause.subCategory = {
          ...whereClause.subCategory,
          slug: { in: subCatList },
        };
      }
    }

    // Filter by price and variants
    const variantWhere: any = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      variantWhere.price = {};
      if (minPrice !== undefined) {
        variantWhere.price.gte = Math.round(minPrice * 100); // convert dollars to cents
      }
      if (maxPrice !== undefined) {
        variantWhere.price.lte = Math.round(maxPrice * 100);
      }
    }

    if (inStock) {
      variantWhere.stock = { gt: 0 };
    }

    if (sizeParam) {
      const sizes = sizeParam.split(",").filter(Boolean);
      if (sizes.length > 0) {
        variantWhere.size = { in: sizes };
      }
    }

    if (Object.keys(variantWhere).length > 0) {
      whereClause.variants = {
        some: variantWhere,
      };
    }

    // Sort order
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") {
      orderBy = { createdAt: "asc" }; // Secondary order
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

    // Client-side sorting by variant price if needed
    if (sort === "price-asc") {
      products.sort((a, b) => {
        const minA = Math.min(...a.variants.map((v) => v.price));
        const minB = Math.min(...b.variants.map((v) => v.price));
        return minA - minB;
      });
    } else if (sort === "price-desc") {
      products.sort((a, b) => {
        const minA = Math.min(...a.variants.map((v) => v.price));
        const minB = Math.min(...b.variants.map((v) => v.price));
        return minB - minA;
      });
    }

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
      { error: error.message || "Failed to fetch filtered products" },
      { status: 500 }
    );
  }
}
