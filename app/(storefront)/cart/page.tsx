"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Banknote, ShieldCheck } from "lucide-react";

export default function FullCartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg space-y-4">
        <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center text-primary">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is currently empty</h1>
        <p className="text-muted-foreground text-sm">
          Explore our slipper collection to add your favorite leather slippers, plush house shoes, or care products.
        </p>
        <Link href="/">
          <Button className="mt-4 font-semibold">Browse Slipper Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Shopping Cart</h1>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-xs text-muted-foreground">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="p-4 border rounded-xl bg-card flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted border shrink-0">
                <Image
                  src={item.image || "https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=300"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 w-full space-y-1 text-center sm:text-left">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-semibold text-base hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground">{item.variantInfo}</p>
                <p className="font-bold text-sm text-primary pt-1">
                  {formatCurrency(item.price)} each
                </p>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="p-1.5 hover:bg-muted transition-colors rounded-l-lg"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="p-1.5 hover:bg-muted transition-colors rounded-r-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-bold text-base block">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 mt-0.5 ml-auto"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border p-6 rounded-xl bg-card space-y-6">
          <h2 className="font-bold text-lg border-b pb-3">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
              <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <Banknote className="h-4 w-4 text-amber-600" /> Cash on Delivery (COD)
            </div>
            <p>You pay in cash directly to the courier when your slipper order is delivered.</p>
          </div>

          <Link href="/checkout" className="block">
            <Button className="w-full h-12 text-base font-bold gap-2">
              Proceed to Guest Checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
