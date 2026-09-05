"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowDown } from "lucide-react";

interface CollectionProductGridProps {
  initialProducts: any[];
  initialTotalCount: number;
  slug: string;
  sort: string;
  collectionTitle: string;
}

export function CollectionProductGrid({
  initialProducts,
  initialTotalCount,
  slug,
  sort,
  collectionTitle,
}: CollectionProductGridProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount] = useState(initialTotalCount);

  const hasMore = products.length < totalCount;

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams({
        slug,
        page: nextPage.toString(),
        limit: "12",
        sort,
      });

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more products");

      const data = await res.json();
      if (Array.isArray(data.products)) {
        setProducts((prev) => [...prev, ...data.products]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load more products.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (products.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-10">
      {/* Product Grid */}
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

      {/* Progress & Load More Section */}
      <div className="text-center space-y-4 pt-4 border-t max-w-md mx-auto">
        <p className="text-xs text-muted-foreground font-medium">
          Showing <span className="font-bold text-foreground">{products.length}</span> of{" "}
          <span className="font-bold text-foreground">{totalCount}</span> products
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, (products.length / totalCount) * 100)}%` }}
          />
        </div>

        {hasMore && (
          <div className="pt-2">
            <Button
              size="lg"
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="h-12 px-8 font-extrabold text-xs uppercase tracking-wider rounded-xl gap-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading 12 More...
                </>
              ) : (
                <>
                  Load More Products <ArrowDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
