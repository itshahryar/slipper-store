import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import Link from "next/link";
import { Footprints, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    subcategory?: string;
    search?: string;
  }>;
}

export default async function StorefrontHomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedSubCategorySlug = params.subcategory;
  const searchQuery = params.search;

  // 1. Fetch active categories and subcategories from DB
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const allSubcategories = categories.flatMap((c) => c.subcategories);

  // 2. Build where filter for products
  const whereClause: any = { isActive: true };

  if (selectedSubCategorySlug) {
    const subCat = allSubcategories.find((s) => s.slug === selectedSubCategorySlug);
    if (subCat) {
      whereClause.subCategoryId = subCat.id;
    }
  }

  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      subCategory: true,
      variants: true,
    },
    orderBy: {
      isFeatured: "desc",
    },
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Single Category Hero Banner */}
      <section className="relative bg-gradient-to-b from-primary/10 via-background to-background py-16 px-4 border-b overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Handcrafted Footwear Specialist
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Exceptional Slippers & Footwear Care, Crafted for Unmatched Comfort.
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our hand-curated selection of calfskin leather slippers, plush shearling home slides, and professional care kits. Delivered straight to your door with <strong>Cash on Delivery (COD)</strong>.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-muted-foreground border-t border-border/50 max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <Footprints className="h-4 w-4 text-primary" /> Premium Leather & Shearling
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> 100% Quality Guaranteed
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-primary" /> No Card Needed (COD Only)
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Category Filter Pills & Catalog */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                !selectedSubCategorySlug
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              All Items
            </Link>

            {allSubcategories.map((subCat) => {
              const isActive = selectedSubCategorySlug === subCat.slug;
              return (
                <Link
                  key={subCat.id}
                  href={`/?subcategory=${subCat.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {subCat.name}
                </Link>
              );
            })}
          </div>

          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Showing {products.length} {products.length === 1 ? "product" : "products"}
          </span>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-card space-y-4">
            <Footprints className="h-12 w-12 stroke-1 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              There are no active products in this category. Try selecting another subcategory filter.
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  category: product.subCategory?.name || "General",
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
