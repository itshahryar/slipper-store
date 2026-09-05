import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { CollectionSortSelect } from "@/components/store/collection-sort-select";
import { SlidersHorizontal, ChevronRight } from "lucide-react";

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
      include: { subcategories: true },
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
    } else if (subCategory) {
      whereClause.subCategoryId = subCategory.id;
      collectionTitle = subCategory.name;
      parentCategoryTitle = subCategory.category.name;
    }
  }

  // Sort ordering
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") {
    orderBy = { variants: { _count: "asc" } }; // Fallback sort
  } else if (sort === "name-asc") {
    orderBy = { name: "asc" };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      subCategory: {
        include: { category: true },
      },
      variants: true,
    },
    orderBy,
  });

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
            {category.subcategories.map((sub) => (
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

      {/* Servis-Style Filter & Sorting Bar */}
      <div className="bg-muted/40 border-y py-3.5 px-4">
        <div className="container mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-foreground">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="uppercase tracking-wider">Show Filters</span>
          </div>

          <div className="text-muted-foreground font-medium">
            {products.length} {products.length === 1 ? "Product" : "Products"}
          </div>

          <CollectionSortSelect defaultValue={sort || "newest"} />
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 max-w-7xl">
        {products.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-card space-y-4">
            <h3 className="text-lg font-bold">No products in this collection</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Check back soon for new arrivals in {collectionTitle}, or explore our other collections.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider"
            >
              Return to Storefront
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  category: product.subCategory?.name || "Footwear",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
