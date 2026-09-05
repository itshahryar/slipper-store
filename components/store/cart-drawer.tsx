"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Banknote } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-background shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Your Cart</h2>
              <span className="text-xs text-muted-foreground">({items.length} items)</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 divide-y">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <ShoppingBag className="h-16 w-16 stroke-1 mb-4 text-muted" />
                <p className="font-medium text-foreground text-lg mb-1">Your cart is empty</p>
                <p className="text-sm max-w-xs mb-6">
                  Browse our selection of premium slippers, slides, and care products.
                </p>
                <Button onClick={() => setIsCartOpen(false)}>Start Shopping</Button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={`${item.variantId}-${item.variantInfo}-${idx}`} className="py-4 flex gap-4">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted border shrink-0">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=300"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-medium text-sm hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.variantId, item.variantInfo)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-2 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-primary mt-0.5">{item.variantInfo}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1, item.variantInfo)}
                          className="p-1 hover:bg-muted transition-colors rounded-l-md cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1, item.variantInfo)}
                          className="p-1 hover:bg-muted transition-colors rounded-r-md cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-semibold text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t bg-muted/20 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Banknote className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Cash on Delivery:</strong> No advance payment required. Pay when you receive your order.
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>Total Amount</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                  <Button className="w-full h-11 text-base gap-2 font-semibold">
                    Proceed to Guest Checkout <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-xs text-muted-foreground"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
