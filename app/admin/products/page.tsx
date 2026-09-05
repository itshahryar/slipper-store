import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AdminProductTable } from "@/components/admin/admin-product-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch active categories and subcategories for admin table filters
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
        select: { id: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Products & Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage slipper catalog, pricing, variants, and stock with paginated optimization.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="font-bold gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <AdminProductTable categories={categories} />
    </div>
  );
}
