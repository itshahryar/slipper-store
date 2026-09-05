import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { HeroSlider } from "@/components/store/hero-slider";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StorefrontHomePage() {
  // 1. Fetch active categories for visual category grid
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
      },
    },
  });

  // 2. Fetch featured products for bestsellers section
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      subCategory: true,
      variants: true,
    },
    take: 4,
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Luxury Hero Slider (Replaces static text banner) */}
      <HeroSlider />

      {/* Category Showcase Grid (Havaianas Visual Style) */}
      <section className="container mx-auto px-4 max-w-7xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight uppercase">Explore Collections</h2>
          <p className="text-muted-foreground text-sm">Choose your category to view specialized slipper styles</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* WOMEN Category Card */}
          <Link
            href="/collections/women"
            className="group relative h-96 rounded-2xl overflow-hidden border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 bg-neutral-900"
          >
            <Image
              src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600"
              alt="Women Slippers"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">For Her</span>
              <h3 className="text-2xl font-extrabold tracking-tight uppercase">WOMEN</h3>
              <p className="text-xs text-neutral-300">Plush home slippers & comfort slides</p>
              <div className="pt-2 font-bold text-xs flex items-center gap-1 text-white group-hover:underline">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* MEN Category Card */}
          <Link
            href="/collections/men"
            className="group relative h-96 rounded-2xl overflow-hidden border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 bg-neutral-900"
          >
            <Image
              src="https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=600"
              alt="Men Slippers"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">For Him</span>
              <h3 className="text-2xl font-extrabold tracking-tight uppercase">MEN</h3>
              <p className="text-xs text-neutral-300">Italian leather slippers & Peshawari</p>
              <div className="pt-2 font-bold text-xs flex items-center gap-1 text-white group-hover:underline">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* KIDS Category Card */}
          <Link
            href="/collections/kids"
            className="group relative h-96 rounded-2xl overflow-hidden border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 bg-neutral-900"
          >
            <Image
              src="https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=600"
              alt="Kids Slippers"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Little Feet</span>
              <h3 className="text-2xl font-extrabold tracking-tight uppercase">KIDS</h3>
              <p className="text-xs text-neutral-300">Fun slides & cushioned house shoes</p>
              <div className="pt-2 font-bold text-xs flex items-center gap-1 text-white group-hover:underline">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* CARE & ACCESSORIES Card */}
          <Link
            href="/collections/care-accessories"
            className="group relative h-96 rounded-2xl overflow-hidden border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 bg-neutral-900"
          >
            <Image
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600"
              alt="Care & Polish"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Care Kits</span>
              <h3 className="text-2xl font-extrabold tracking-tight uppercase">CARE & POLISH</h3>
              <p className="text-xs text-neutral-300">Natural polish & horsehair shine brushes</p>
              <div className="pt-2 font-bold text-xs flex items-center gap-1 text-white group-hover:underline">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Bestsellers Section */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl space-y-8 border-t pt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight uppercase">Bestselling Slippers</h2>
              <p className="text-sm text-muted-foreground">Hand-selected customer favorites</p>
            </div>
            <Link href="/collections/all">
              <Button variant="outline" className="font-bold text-xs uppercase tracking-wider gap-1">
                View All Slippers &rarr;
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  category: product.subCategory?.name || "Footwear",
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
