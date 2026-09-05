"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { createGuestOrder } from "@/app/actions/checkout";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Truck, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">Add items to your cart before proceeding to checkout.</p>
        <Link href="/">
          <Button>Return to Store</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createGuestOrder({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        address: formData.address,
        notes: formData.notes,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      });

      if (res.error) {
        setErrorMsg(res.error);
        setIsSubmitting(false);
      } else if (res.success && res.orderNumber) {
        clearCart();
        router.push(`/order-success/${res.orderNumber}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to place order. Please check your internet connection and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      <div>
        <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight mt-2">Guest Checkout</h1>
        <p className="text-sm text-muted-foreground">No registration needed. Fill in your delivery details below.</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 columns: Delivery Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border p-6 rounded-xl bg-card space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-3">
              <Truck className="h-5 w-5 text-primary" /> Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  required
                  placeholder="e.g. Alexander Vance"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="customerPhone">Phone Number (Required for Delivery) *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Full Delivery Address *</Label>
                <Input
                  id="address"
                  required
                  placeholder="House/Apartment #, Street Address, City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="e.g. Gate code #1234, call before arriving"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment Method Notice */}
          <div className="border p-6 rounded-xl bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-base">
              <Banknote className="h-5 w-5 text-amber-600" /> Cash on Delivery (COD) Only
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
              No prepayment or card details required! Pay cash upon inspecting your order delivery.
            </p>
          </div>
        </div>

        {/* Right column: Order Breakdown */}
        <div className="border p-6 rounded-xl bg-card space-y-6">
          <h2 className="font-bold text-lg border-b pb-3">Your Order</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-xs items-center border-b pb-2">
                <div>
                  <span className="font-medium block text-foreground line-clamp-1">{item.name}</span>
                  <span className="text-muted-foreground block">{item.variantInfo} x {item.quantity}</span>
                </div>
                <span className="font-bold text-foreground shrink-0">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm pt-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Charge</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-xl text-foreground">
              <span>Total Payable</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-bold gap-2">
            {isSubmitting ? "Placing Order..." : "Confirm & Place COD Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
