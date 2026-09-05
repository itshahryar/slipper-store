import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Banknote, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderSuccessPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      {/* Success Banner */}
      <div className="text-center space-y-3 p-8 border rounded-2xl bg-card">
        <div className="p-3 bg-green-500/10 text-green-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Order Placed Successfully!</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Thank you for shopping with <strong>Slipper Vault</strong>. Your Cash on Delivery order has been placed.
        </p>

        <div className="inline-block bg-muted px-4 py-2 rounded-lg text-sm font-mono font-bold mt-2">
          Order Reference: <span className="text-primary">{order.orderNumber}</span>
        </div>
      </div>

      {/* Order Summary & Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Details */}
        <div className="border p-6 rounded-xl bg-card space-y-3 text-sm">
          <h3 className="font-bold flex items-center gap-2 border-b pb-2 text-foreground">
            <Truck className="h-4 w-4 text-primary" /> Delivery Address
          </h3>
          <p className="font-semibold text-foreground">{order.guestName}</p>
          <p className="text-muted-foreground">{order.guestAddress}</p>
          <p className="text-muted-foreground pt-1">Phone: {order.guestPhone}</p>
          {order.note && <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Note: &quot;{order.note}&quot;</p>}
        </div>

        {/* Payment Details */}
        <div className="border p-6 rounded-xl bg-amber-500/10 border-amber-500/20 space-y-3 text-sm text-amber-900 dark:text-amber-300">
          <h3 className="font-bold flex items-center gap-2 border-b border-amber-500/20 pb-2">
            <Banknote className="h-4 w-4 text-amber-600" /> Payment Terms
          </h3>
          <p className="font-semibold">Method: Cash on Delivery (COD)</p>
          <p className="text-xs leading-relaxed">
            Please prepare <strong>{formatCurrency(order.totalAmount)}</strong> in cash for the courier when your slippers arrive.
          </p>
          <p className="text-xs text-muted-foreground pt-1">
            Status: <span className="font-bold text-amber-700 dark:text-amber-400">{order.status}</span>
          </p>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="border p-6 rounded-xl bg-card space-y-4">
        <h3 className="font-bold text-base border-b pb-3">Items Ordered</h3>
        <div className="space-y-3 divide-y">
          {order.items.map((item: any) => (
            <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-center text-sm">
              <div>
                <span className="font-semibold block">{item.productSnapshot}</span>
                <span className="text-xs text-muted-foreground block">
                  {item.variantSnapshot || "Standard"} × {item.quantity}
                </span>
              </div>
              <span className="font-bold">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex justify-between font-bold text-lg">
          <span>Total Amount</span>
          <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/">
          <Button size="lg" className="font-bold">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
