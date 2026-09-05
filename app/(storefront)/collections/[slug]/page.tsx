import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CollectionProductGrid } from "@/components/store/collection-product-grid";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;

  let category = null;
  let subCategory = null;
  let collectionTitle = "";
  let parentCategoryTitle = null;
  let availableSubcategories: { id: string; name: string; slug: string }[] = [];

  const whereClause: any = { isActive: true };

  // Special Collection Routes: "bestsellers" or "all"
  if (slug === "bestsellers") {
    collectionTitle = "Bestselling Slippers";
    whereClause.isFeatured = true;
  } else if (slug === "all") {
    collectionTitle = "All Slippers & Care Products";
  } else {
    // Try finding parent Category by slug first
    category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
        },
      },
    });

    // If not a parent Category, try finding SubCategory by slug
    if (!category) {
      subCategory = await prisma.subCategory.findUnique({
        where: { slug },
        include: { category: true },
      });
    }

    if (!category && !subCategory) {
      notFound();
    }

    if (category) {
      whereClause.subCategory = { categoryId: category.id };
      collectionTitle = category.name;
      availableSubcategories = category.subcategories;
    } else if (subCategory) {
      whereClause.subCategoryId = subCategory.id;
      collectionTitle = subCategory.name;
      parentCategoryTitle = subCategory.category.name;
    }
  }

  // Sort ordering
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "name-asc") {
    orderBy = { name: "asc" };
  }

  // Optimized Initial Load: Fetch only first 12 items + totalCount
  const [totalCount, initialProducts] = await prisma.$transaction([
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
      take: 12,
    }),
  ]);

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-muted/30 border-b py-4 px-4">
        <div className="container mx-auto max-w-7xl flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/collections/all" className="hover:text-foreground">Collections</Link>
          {parentCategoryTitle && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{parentCategoryTitle}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="font-bold text-foreground uppercase">{collectionTitle}</span>
        </div>
      </div>

      {/* Collection Title Banner */}
      <div className="container mx-auto px-4 max-w-7xl space-y-2 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-foreground">
          {collectionTitle}
        </h1>
        {category && category.subcategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {category.subcategories.map((sub: any) => (
              <Link
                key={sub.id}
                href={`/collections/${sub.slug}`}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Paginated Product Grid with Interactive Client API Filter Drawer */}
      <div className="container mx-auto px-4 max-w-7xl">
        <CollectionProductGrid
          initialProducts={initialProducts}
          initialTotalCount={totalCount}
          slug={slug}
          sort={sort || "newest"}
          collectionTitle={collectionTitle}
          subCategories={availableSubcategories}
        />
      </div>
    </div>
  );
}
