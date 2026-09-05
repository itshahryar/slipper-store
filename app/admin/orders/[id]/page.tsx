import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/app/actions/orders";
import { ArrowLeft, User, MapPin, PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
            Order #{order.orderNumber}
            <Badge variant="outline" className="text-sm font-semibold">
              {order.status}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Update Order Status Form */}
      <div className="border p-6 rounded-2xl bg-card space-y-4">
        <h2 className="font-bold text-base border-b pb-2 flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-primary" /> Update Order Status
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as OrderStatus[]).map(
            (status) => {
              const isCurrent = order.status === status;
              return (
                <form
                  key={status}
                  action={async () => {
                    "use server";
                    await updateOrderStatusAction(order.id, status);
                  }}
                >
                  <Button
                    type="submit"
                    variant={isCurrent ? "default" : "outline"}
                    disabled={isCurrent}
                    size="sm"
                    className="font-bold text-xs"
                  >
                    Mark as {status}
                  </Button>
                </form>
              );
            }
          )}
        </div>
      </div>

      {/* Customer & Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-6 rounded-2xl bg-card space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2 border-b pb-2">
            <User className="h-4 w-4 text-primary" /> Customer Contact Info
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">{order.guestName}</p>
            <p className="text-muted-foreground">Phone: {order.guestPhone}</p>
          </div>
        </div>

        <div className="border p-6 rounded-2xl bg-card space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2 border-b pb-2">
            <MapPin className="h-4 w-4 text-primary" /> Delivery Address
          </h3>
          <div className="space-y-1 text-sm">
            <p className="text-foreground">{order.guestAddress}</p>
            {order.note && (
              <p className="text-xs text-amber-700 dark:text-amber-400 pt-1 font-medium">
                Note: &quot;{order.note}&quot;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="border p-6 rounded-2xl bg-card space-y-4">
        <h3 className="font-bold text-base border-b pb-3">Items Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Variant Details</th>
                <th className="px-4 py-2.5">Unit Price</th>
                <th className="px-4 py-2.5">Qty</th>
                <th className="px-4 py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-semibold text-foreground">{item.productSnapshot}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{item.variantSnapshot || "Standard"}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 font-bold">{item.quantity}</td>
                  <td className="px-4 py-3 font-bold text-right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t pt-4 flex justify-between font-bold text-lg">
          <span>Total COD Payable</span>
          <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
