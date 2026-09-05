"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteProductAction } from "@/app/actions/products";
import {
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

export interface CategoryOption {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

interface AdminProductTableProps {
  categories: CategoryOption[];
}

export function AdminProductTable({ categories }: AdminProductTableProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch paginated products from API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
      if (selectedSubCategoryId) params.set("subCategoryId", selectedSubCategoryId);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      setProducts(data.products || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, selectedCategoryId, selectedSubCategoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset subcategory selection when category changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
    setSelectedSubCategoryId("");
    setCurrentPage(1);
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubCategoryId(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategoryId("");
    setSelectedSubCategoryId("");
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      await deleteProductAction(deletingProduct.id);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Subcategories available for selected category
  const activeCategory = categories.find((c) => c.id === selectedCategoryId);
  const availableSubcategories = activeCategory ? activeCategory.subcategories : [];

  return (
    <div className="space-y-4">
      {/* 1. Filter & Search Controls Bar */}
      <div className="p-4 border rounded-2xl bg-card space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search product by name or slug..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              className="w-full h-9 px-3 rounded-md border bg-background text-xs font-semibold"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedSubCategoryId}
              onChange={handleSubCategoryChange}
              disabled={!selectedCategoryId}
              className="w-full h-9 px-3 rounded-md border bg-background text-xs font-semibold disabled:opacity-50"
            >
              <option value="">All Subcategories</option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {(search || selectedCategoryId || selectedSubCategoryId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 px-3 text-xs gap-1 font-semibold text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* 2. Paginated Products Table */}
      <div className="border rounded-2xl bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-xs text-muted-foreground">Loading products (10 per page)...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold">No products found matching filters.</p>
            <p className="text-xs text-muted-foreground">Try clearing your category or search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Variants</th>
                  <th className="px-4 py-3">Stock Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => {
                  const totalStock = product.variants.reduce((acc: number, v: any) => acc + v.stock, 0);
                  const prices = product.variants.map((v: any) => v.price);
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  const primaryImage =
                    product.images[0] ||
                    "https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=200";

                  return (
                    <tr key={product.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3.5 flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border">
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold block text-foreground line-clamp-1">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            /{product.slug}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="text-xs font-semibold">
                          {product.subCategory?.category?.name} → {product.subCategory?.name}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 font-bold">
                        {formatCurrency(minPrice)}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {product.variants.length} variant(s)
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`font-semibold text-xs px-2.5 py-1 rounded-full ${
                            totalStock > 10
                              ? "bg-green-500/10 text-green-600"
                              : totalStock > 0
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </Link>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingProduct(product)}
                          className="h-8 gap-1 text-xs font-bold"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Pagination Controls Bar (10 items limit per page) */}
        {!isLoading && totalCount > 0 && (
          <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-muted-foreground font-semibold">
              Showing <span className="text-foreground font-bold">{(currentPage - 1) * 10 + 1}</span> to{" "}
              <span className="text-foreground font-bold">{Math.min(currentPage * 10, totalCount)}</span> of{" "}
              <span className="text-foreground font-bold">{totalCount}</span> products
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 gap-1 font-semibold text-xs"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <div className="px-3 font-bold text-foreground">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 px-2.5 gap-1 font-semibold text-xs"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product?"
        description={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone and will permanently remove all product variants.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
