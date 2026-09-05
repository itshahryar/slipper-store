import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const products = await prisma.product.findMany({
    include: {
      subCategory: {
        include: { category: true },
      },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Products & Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage slipper catalog, pricing, variants, and stock.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="font-bold gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="border rounded-2xl bg-card overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="h-10 w-10 mx-auto text-muted" />
            <p className="text-sm text-muted-foreground">No products found in inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price Range</th>
                  <th className="px-4 py-3">Variants</th>
                  <th className="px-4 py-3">Total Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product: any) => {
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

                      <td className="px-4 py-3.5 text-right space-x-1">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
