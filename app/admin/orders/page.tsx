import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@prisma/client";
import { ShoppingBag, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

const STATUSES: { key: string; label: string }[] = [
  { key: "ALL", label: "All Orders" },
  { key: "PENDING", label: "Pending COD" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { status } = await searchParams;

  const whereClause: any = {};
  if (status && status !== "ALL") {
    whereClause.status = status as OrderStatus;
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Guest COD Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer cash on delivery orders and update delivery status.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b">
        {STATUSES.map((st) => {
          const isActive = (!status && st.key === "ALL") || status === st.key;
          return (
            <Link
              key={st.key}
              href={st.key === "ALL" ? "/admin/orders" : `/admin/orders?status=${st.key}`}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {st.label}
            </Link>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="border rounded-2xl bg-card overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted" />
            <p className="text-sm text-muted-foreground">No orders matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Order Ref</th>
                  <th className="px-4 py-3">Customer & Phone</th>
                  <th className="px-4 py-3">Delivery Address</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total (COD)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5 font-mono font-bold text-primary">
                      {order.orderNumber}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold block text-foreground">{order.guestName}</span>
                      <span className="text-xs text-muted-foreground">{order.guestPhone}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground line-clamp-1">{order.guestAddress}</span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} item(s)
                    </td>

                    <td className="px-4 py-3.5 font-bold text-foreground">
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
                        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-semibold">
                          <Eye className="h-3.5 w-3.5" /> Details
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
