"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { CollectionSortSelect } from "@/components/store/collection-sort-select";
import { CollectionFilterDrawer, FilterState } from "@/components/store/collection-filter-drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowDown, SlidersHorizontal, RotateCcw } from "lucide-react";

interface CollectionProductGridProps {
  initialProducts: any[];
  initialTotalCount: number;
  slug: string;
  sort: string;
  collectionTitle: string;
  subCategories?: { id: string; name: string; slug: string }[];
}

const DEFAULT_FILTERS: FilterState = {
  minPrice: "",
  maxPrice: "",
  subCategories: [],
  sizes: [],
  inStock: false,
};

export function CollectionProductGrid({
  initialProducts,
  initialTotalCount,
  slug,
  sort: initialSort,
  collectionTitle,
  subCategories = [],
}: CollectionProductGridProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [currentSort, setCurrentSort] = useState(initialSort || "newest");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Count active filters
  const activeFilterCount =
    (activeFilters.minPrice ? 1 : 0) +
    (activeFilters.maxPrice ? 1 : 0) +
    activeFilters.subCategories.length +
    activeFilters.sizes.length +
    (activeFilters.inStock ? 1 : 0);

  const hasMore = products.length < totalCount;

  // Fetch products with active filters & sorting via Client API
  const fetchFilteredProducts = async (
    newFilters: FilterState,
    newSort: string,
    pageNum = 1,
    append = false
  ) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams({
        slug,
        page: pageNum.toString(),
        limit: "12",
        sort: newSort,
      });

      if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
      if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
      if (newFilters.subCategories.length > 0) params.set("subCategories", newFilters.subCategories.join(","));
      if (newFilters.sizes.length > 0) params.set("sizes", newFilters.sizes.join(","));
      if (newFilters.inStock) params.set("inStock", "true");

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      if (Array.isArray(data.products)) {
        if (append) {
          setProducts((prev) => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        setTotalCount(data.totalCount || 0);
        setPage(pageNum);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to filter/sort products.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSortChange = (newSort: string) => {
    setCurrentSort(newSort);
    fetchFilteredProducts(activeFilters, newSort, 1, false);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setActiveFilters(newFilters);
    fetchFilteredProducts(newFilters, currentSort, 1, false);
  };

  const handleResetFilters = () => {
    setActiveFilters(DEFAULT_FILTERS);
    fetchFilteredProducts(DEFAULT_FILTERS, currentSort, 1, false);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    fetchFilteredProducts(activeFilters, currentSort, page + 1, true);
  };

  return (
    <div className="space-y-8">
      {/* Servis-Style Filter & Sorting Bar */}
      <div className="bg-muted/40 border-y py-3.5 px-4 -mx-4 sm:-mx-8">
        <div className="container mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-foreground">
          {/* Show Filters Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="uppercase tracking-wider">Show Filters</span>
            {activeFilterCount > 0 && (
              <Badge className="bg-primary text-primary-foreground h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </button>

          {/* Product Count Display */}
          <div className="text-muted-foreground font-medium">
            {totalCount} {totalCount === 1 ? "Product" : "Products"}
          </div>

          {/* Instant Client API Sort Dropdown */}
          <CollectionSortSelect defaultValue={currentSort} onChange={handleSortChange} />
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground font-semibold">Active Filters:</span>
          {activeFilters.minPrice && (
            <Badge variant="outline" className="text-xs">Min: ${activeFilters.minPrice}</Badge>
          )}
          {activeFilters.maxPrice && (
            <Badge variant="outline" className="text-xs">Max: ${activeFilters.maxPrice}</Badge>
          )}
          {activeFilters.subCategories.map((s) => (
            <Badge key={s} variant="outline" className="text-xs uppercase">{s}</Badge>
          ))}
          {activeFilters.sizes.map((sz) => (
            <Badge key={sz} variant="outline" className="text-xs">{sz}</Badge>
          ))}
          {activeFilters.inStock && (
            <Badge variant="outline" className="text-xs">In Stock Only</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-7 text-[11px] font-semibold gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Clear All
          </Button>
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground">Updating slippers...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card space-y-4">
          <h3 className="text-lg font-bold">No products match your criteria</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Try adjusting your sorting option or clearing selected size/subcategory filters.
          </p>
          <Button onClick={handleResetFilters} className="font-bold text-xs uppercase tracking-wider">
            Clear All Filters
          </Button>
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

      {/* Progress & Load More Section */}
      {!isLoading && products.length > 0 && (
        <div className="text-center space-y-4 pt-6 border-t max-w-md mx-auto">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="font-bold text-foreground">{products.length}</span> of{" "}
            <span className="font-bold text-foreground">{totalCount}</span> products
          </p>

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
      )}

      {/* Slide-over Filter Drawer */}
      <CollectionFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        subCategories={subCategories}
        activeFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}
