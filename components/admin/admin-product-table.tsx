"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteProductAction } from "@/app/actions/products";
import {
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Star,
  StarOff,
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

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), limit: "10" });
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

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);
  const availableSubcategories = activeCategory ? activeCategory.subcategories : [];

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or slug..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 text-xs h-9"
          />
        </div>

        <select
          value={selectedCategoryId}
          onChange={handleCategoryChange}
          className="w-full sm:w-44 h-9 px-3 rounded-md border bg-background text-xs font-semibold"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={selectedSubCategoryId}
          onChange={handleSubCategoryChange}
          disabled={!selectedCategoryId}
          className="w-full sm:w-44 h-9 px-3 rounded-md border bg-background text-xs font-semibold disabled:opacity-50"
        >
          <option value="">All Subcategories</option>
          {availableSubcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>

        {(search || selectedCategoryId || selectedSubCategoryId) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-9 px-3 text-xs gap-1 font-semibold text-muted-foreground hover:text-foreground shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-2xl bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-14 text-center space-y-2">
            <p className="text-sm font-semibold">No products found.</p>
            <p className="text-xs text-muted-foreground">Try clearing filters or adding a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase bg-muted/50 text-muted-foreground border-b tracking-wider">
                <tr>
                  <th className="px-4 py-3 min-w-[220px]">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Sub Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => {
                  const prices = product.variants.map((v: any) => v.price);
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                  const totalStock = product.variants.reduce((acc: number, v: any) => acc + v.stock, 0);
                  const primaryImage =
                    product.images?.[0] ||
                    "https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=200";

                  return (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      {/* Product Image + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border">
                            <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-foreground line-clamp-1">{product.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">/{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-foreground bg-muted px-2.5 py-1 rounded-md whitespace-nowrap">
                          {product.subCategory?.category?.name || "—"}
                        </span>
                      </td>

                      {/* Sub Category */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                          {product.subCategory?.name || "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-xs text-foreground">
                          {formatCurrency(minPrice)}
                          {minPrice !== maxPrice && (
                            <span className="text-muted-foreground font-normal"> – {formatCurrency(maxPrice)}</span>
                          )}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span className={`font-semibold text-xs px-2.5 py-1 rounded-full ${
                          totalStock > 10
                            ? "bg-green-500/10 text-green-600"
                            : totalStock > 0
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-red-500/10 text-red-600"
                        }`}>
                          {totalStock > 0 ? totalStock : "0"}
                        </span>
                      </td>

                      {/* isActive */}
                      <td className="px-4 py-3 text-center">
                        {product.isActive ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                        )}
                      </td>

                      {/* isFeatured */}
                      <td className="px-4 py-3 text-center">
                        {product.isFeatured ? (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 mx-auto" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground mx-auto" />
                        )}
                      </td>

                      {/* Action Buttons (icons only) */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="Edit Product"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingProduct(product)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && totalCount > 0 && (
          <div className="px-4 py-3 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-muted-foreground font-medium">
              Showing{" "}
              <span className="text-foreground font-bold">{(currentPage - 1) * 10 + 1}</span>
              {" "}–{" "}
              <span className="text-foreground font-bold">{Math.min(currentPage * 10, totalCount)}</span>
              {" "}of{" "}
              <span className="text-foreground font-bold">{totalCount}</span>{" "}products
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="font-bold text-foreground px-1">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 w-8"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
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
        description={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone and will permanently remove all its variants.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
}
