"use client";

import Link from "next/link";
import { ShoppingBag, Footprints, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";

export function StoreHeader() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-1.5 px-4 text-xs font-medium text-center flex items-center justify-center gap-6">
        <span className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" /> Cash on Delivery (COD) Available Nationwide
        </span>
        <span className="hidden md:inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> 100% Genuine Handcrafted Slippers
        </span>
      </div>

      {/* Main Header Nav */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:scale-105 transition-transform">
            <Footprints className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-foreground block leading-none">
              SLIPPER VAULT
            </span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase block mt-0.5">
              Slippers & Foot Care
            </span>
          </div>
        </Link>

        {/* Navigation Categories */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            All Products
          </Link>
          <Link
            href="/?subcategory=leather-slippers"
            className="hover:text-foreground transition-colors"
          >
            Leather Slippers
          </Link>
          <Link
            href="/?subcategory=plush-home-slippers"
            className="hover:text-foreground transition-colors"
          >
            Plush Home Slippers
          </Link>
          <Link
            href="/?subcategory=slide-sandals"
            className="hover:text-foreground transition-colors"
          >
            Slides & Sandals
          </Link>
          <Link
            href="/?subcategory=polish-care-kits"
            className="hover:text-foreground transition-colors"
          >
            Care & Polish
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {totalItems}
              </span>
            )}
          </Button>

          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
