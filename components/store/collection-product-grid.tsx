"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { CollectionSortSelect } from "@/components/store/collection-sort-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowDown,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  sizes: string[];
  inStock: boolean;
}

interface CollectionProductGridProps {
  initialProducts: any[];
  initialTotalCount: number;
  slug: string;
  sort: string;
  collectionTitle: string;
}

const DEFAULT_FILTERS: FilterState = {
  minPrice: "",
  maxPrice: "",
  sizes: [],
  inStock: false,
};

const AVAILABLE_SIZES = ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"];

export function CollectionProductGrid({
  initialProducts,
  initialTotalCount,
  slug,
  sort: initialSort,
  collectionTitle,
}: CollectionProductGridProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [currentSort, setCurrentSort] = useState(initialSort || "newest");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Attached Filter Panel State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Count active filters
  const activeFilterCount =
    (activeFilters.minPrice ? 1 : 0) +
    (activeFilters.maxPrice ? 1 : 0) +
    activeFilters.sizes.length +
    (activeFilters.inStock ? 1 : 0);

  const hasMore = products.length < totalCount;

  // Toggle size selection in draft filters
  const toggleSize = (size: string) => {
    setDraftFilters((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
      };
    });
  };

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

  const handleApplyPanelFilters = () => {
    setActiveFilters(draftFilters);
    fetchFilteredProducts(draftFilters, currentSort, 1, false);
  };

  const handleClearPanelFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
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
      <div className="bg-muted/40 border rounded-2xl py-3.5 px-4 sm:px-6 w-full">
        <div className="w-full flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-foreground">
          {/* Show / Hide Filters Toggle Button */}
          <button
            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
            className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="uppercase tracking-wider">
              {isFilterPanelOpen ? "Hide Filters" : "Show Filters"}
            </span>
            {activeFilterCount > 0 && (
              <Badge className="bg-primary text-primary-foreground h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
            {isFilterPanelOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {/* Product Count Display */}
          <div className="text-muted-foreground font-medium">
            {totalCount} {totalCount === 1 ? "Product" : "Products"}
          </div>

          {/* Instant Client API Sort Dropdown */}
          <CollectionSortSelect defaultValue={currentSort} onChange={handleSortChange} />
        </div>

        {/* ATTACHED INLINE FILTER PANEL */}
        {isFilterPanelOpen && (
          <div className="border-t border-border/60 pt-4 pb-2 mt-3 space-y-6 w-full animate-in fade-in-50 slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* 1. Price Range ($) */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                  Price Range ($)
                </h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min ($)"
                    value={draftFilters.minPrice}
                    onChange={(e) => setDraftFilters({ ...draftFilters, minPrice: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                  <span className="text-muted-foreground text-xs">–</span>
                  <Input
                    type="number"
                    placeholder="Max ($)"
                    value={draftFilters.maxPrice}
                    onChange={(e) => setDraftFilters({ ...draftFilters, maxPrice: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              {/* 2. Slipper Size */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                  Slipper Size
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = draftFilters.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`h-7 px-2.5 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Availability & Actions */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                  Availability
                </h4>
                <label
                  onClick={() => setDraftFilters({ ...draftFilters, inStock: !draftFilters.inStock })}
                  className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer"
                >
                  <div
                    className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                      draftFilters.inStock ? "bg-primary border-primary text-primary-foreground" : "border-gray-300 bg-background"
                    }`}
                  >
                    {draftFilters.inStock && <Check className="h-3 w-3" />}
                  </div>
                  <span>In Stock Only</span>
                </label>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearPanelFilters}
                    className="h-8 px-3 text-xs font-bold uppercase gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplyPanelFilters}
                    className="h-8 px-4 text-xs font-extrabold uppercase"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
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
          {activeFilters.sizes.map((sz) => (
            <Badge key={sz} variant="outline" className="text-xs">{sz}</Badge>
          ))}
          {activeFilters.inStock && (
            <Badge variant="outline" className="text-xs">In Stock Only</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearPanelFilters}
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
            Try adjusting your price range or clearing selected size filters.
          </p>
          <Button onClick={handleClearPanelFilters} className="font-bold text-xs uppercase tracking-wider">
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
    </div>
  );
}
