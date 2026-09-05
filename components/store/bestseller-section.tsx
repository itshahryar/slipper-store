"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface BestsellerProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  isFeatured?: boolean;
  variants: {
    id: string;
    price: number; // cents
    stock: number;
  }[];
  subCategory?: {
    name: string;
  };
}

interface BestsellerSectionProps {
  products: BestsellerProduct[];
}

export function BestsellerSection({ products }: BestsellerSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full bg-muted/30 py-12 px-4 sm:px-8 border-y">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-stretch gap-8">
          {/* Left Title & Action Block */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col justify-center space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Customer Favorites
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Best Selling Products
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our top-rated slippers and foot care items loved by customers nationwide.
            </p>
            <div className="pt-2">
              <Link href="/collections/bestsellers">
                <Button size="lg" variant="outline" className="font-bold text-xs uppercase tracking-wider h-11 px-6 rounded-lg gap-1 border-primary/40 hover:bg-primary hover:text-primary-foreground">
                  View All Bestsellers &rarr;
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Cards Row */}
          <div className="flex-1 overflow-x-auto scrollbar-none pb-2">
            <div className="flex gap-4 sm:gap-6 min-w-max">
              {products.map((product) => {
                const primaryImage =
                  product.images[0] ||
                  "https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=600";

                const variantPrices = product.variants.map((v) => v.price);
                const minPriceCents = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group w-60 sm:w-72 shrink-0 bg-card border rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                  >
                    {/* Image Container with Top-Right Featured Badge */}
                    <div className="relative aspect-4/3 w-full bg-muted rounded-xl overflow-hidden mb-3">
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 240px, 280px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.isFeatured !== false && (
                        <Badge className="bg-amber-500 text-white font-bold text-[11px] absolute top-2.5 right-2.5 shadow-xs">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-1 text-left">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        {product.subCategory?.name || "Footwear"}
                      </span>
                      <h3 className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="font-extrabold text-sm text-foreground block pt-1">
                        {formatCurrency(minPriceCents)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
