import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Banknote,
  ShoppingBag,
  Package,
  Clock,
  Plus,
  ArrowRight,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [totalOrders, pendingOrders, totalProducts, totalCategories, recentOrders, revenueData] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

  const totalRevenue = revenueData._sum.totalAmount || 0;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your slipper store revenue, pending COD orders, categories, and inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/categories">
            <Button variant="outline" className="font-bold gap-2">
              <Layers className="h-4 w-4" /> Manage Categories
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button className="font-bold gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border p-5 rounded-2xl bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Revenue (COD)</span>
            <Banknote className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-extrabold">{formatCurrency(totalRevenue)}</p>
          <span className="text-[11px] text-muted-foreground block">Across all orders</span>
        </div>

        <div className="border p-5 rounded-2xl bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Orders</span>
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-extrabold">{totalOrders}</p>
          <span className="text-[11px] text-muted-foreground block">Guest customer orders</span>
        </div>

        <div className="border p-5 rounded-2xl bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Pending COD Orders</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{pendingOrders}</p>
          <span className="text-[11px] text-muted-foreground block">Awaiting confirmation</span>
        </div>

        <div className="border p-5 rounded-2xl bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Active Products</span>
            <Package className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold">{totalProducts}</p>
          <span className="text-[11px] text-muted-foreground block">Across {totalCategories} main categories</span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="border rounded-2xl bg-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-bold">Recent Customer Orders</h2>
            <p className="text-xs text-muted-foreground">Guest COD orders placed recently</p>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              View All Orders <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Order Ref</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5 font-mono font-bold text-primary">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      {order.guestName}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {order.guestPhone}
                    </td>
                    <td className="px-4 py-3.5 font-bold">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          order.status === "PENDING"
                            ? "secondary"
                            : order.status === "DELIVERED"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs font-semibold">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
