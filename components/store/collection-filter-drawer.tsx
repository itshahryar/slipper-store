"use client";

import { useState, useEffect } from "react";
import { X, RotateCcw, Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  subCategories: string[]; // slugs
  sizes: string[];
  inStock: boolean;
}

interface CollectionFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subCategories: { id: string; name: string; slug: string }[];
  availableSizes?: string[];
  activeFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export function CollectionFilterDrawer({
  isOpen,
  onClose,
  subCategories,
  availableSizes = ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
  activeFilters,
  onApplyFilters,
  onResetFilters,
}: CollectionFilterDrawerProps) {
  const [filters, setFilters] = useState<FilterState>(activeFilters);

  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);

  if (!isOpen) return null;

  const toggleSubCategory = (slug: string) => {
    setFilters((prev) => {
      const exists = prev.subCategories.includes(slug);
      return {
        ...prev,
        subCategories: exists
          ? prev.subCategories.filter((s) => s !== slug)
          : [...prev.subCategories, slug],
      };
    });
  };

  const toggleSize = (size: string) => {
    setFilters((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: FilterState = {
      minPrice: "",
      maxPrice: "",
      subCategories: [],
      sizes: [],
      inStock: false,
    };
    setFilters(emptyFilters);
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-sm sm:max-w-md bg-background shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-extrabold uppercase tracking-tight">Filter Products</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filter Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Price Range */}
            <div className="space-y-3 border-b pb-5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                Price Range ($)
              </h3>
              <div className="flex items-center gap-3">
                <div className="space-y-1 flex-1">
                  <Label className="text-[11px] text-muted-foreground">Min Price</Label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <span className="text-muted-foreground pt-4">–</span>
                <div className="space-y-1 flex-1">
                  <Label className="text-[11px] text-muted-foreground">Max Price</Label>
                  <Input
                    type="number"
                    placeholder="$150"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. Subcategories Filter */}
            {subCategories.length > 0 && (
              <div className="space-y-3 border-b pb-5">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                  Subcategories
                </h3>
                <div className="space-y-2">
                  {subCategories.map((sub) => {
                    const isChecked = filters.subCategories.includes(sub.slug);
                    return (
                      <label
                        key={sub.id}
                        onClick={() => toggleSubCategory(sub.slug)}
                        className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer hover:text-primary transition-colors py-1"
                      >
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked ? "bg-primary border-primary text-primary-foreground" : "border-gray-300"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                        <span>{sub.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Size Filter */}
            <div className="space-y-3 border-b pb-5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                Slipper Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const isSelected = filters.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`h-9 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-background text-foreground border-border hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Stock Availability */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                Availability
              </h3>
              <label
                onClick={() => setFilters({ ...filters, inStock: !filters.inStock })}
                className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
              >
                <div
                  className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                    filters.inStock ? "bg-primary border-primary text-primary-foreground" : "border-gray-300"
                  }`}
                >
                  {filters.inStock && <Check className="h-3 w-3" />}
                </div>
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-muted/20 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 font-bold text-xs uppercase h-11 gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear All
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 font-extrabold text-xs uppercase h-11"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
