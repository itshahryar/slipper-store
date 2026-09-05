"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Footprints,
  ShieldCheck,
  Truck,
  Search,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavigationDrawer, CategoryWithSub } from "./navigation-drawer";

interface StoreHeaderProps {
  categories?: CategoryWithSub[];
}

export function StoreHeader({ categories = [] }: StoreHeaderProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const router = useRouter();

  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* Top Announcement Bar */}
        <div className="bg-primary text-primary-foreground py-1.5 px-4 text-xs font-medium text-center flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Cash on Delivery (COD) Available Nationwide
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% Genuine Handcrafted Slippers
          </span>
        </div>

        {/* Main Navigation Bar */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Left Group: Menu Button (Left-positioned) + Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNavDrawerOpen(true)}
              className="flex items-center gap-1.5 text-xs font-extrabold px-3 h-9 border-input"
              title="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </Button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:scale-105 transition-transform">
                <Footprints className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-foreground block leading-none">
                  SLIPPER VAULT
                </span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase block mt-0.5 font-semibold">
                  Slippers & Foot Care
                </span>
              </div>
            </Link>
          </div>

          {/* Center Category Navigation with Hover Mega-Menu (Skechers Style) */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.map((category) => {
              const hasSub = category.subcategories && category.subcategories.length > 0;
              return (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => setHoveredCategoryId(category.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                >
                  <Link
                    href={`/collections/${category.slug}`}
                    className="px-3.5 py-2 text-sm font-extrabold tracking-wider text-foreground hover:text-primary transition-colors flex items-center gap-1 uppercase"
                  >
                    {category.name}
                    {hasSub && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
                  </Link>

                  {/* Mega-Menu Dropdown on Hover */}
                  {hasSub && hoveredCategoryId === category.id && (
                    <div className="absolute top-full left-0 w-64 bg-card border rounded-xl shadow-xl p-4 space-y-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
                      <Link
                        href={`/collections/${category.slug}`}
                        className="text-xs font-bold uppercase text-muted-foreground tracking-wider block border-b pb-1 hover:text-primary"
                      >
                        Shop All {category.name} &rarr;
                      </Link>
                      <ul className="space-y-1">
                        {category.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/collections/${sub.slug}`}
                              className="block py-1.5 px-2.5 text-xs font-semibold text-foreground hover:bg-muted hover:text-primary rounded-md transition-colors"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Group: Search Input + Cart Drawer Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="max-w-xs hidden sm:flex items-center relative">
              <Search className="h-4 w-4 absolute left-3 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search slippers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9 text-xs rounded-full bg-muted/50 border-input focus-visible:bg-background w-48 lg:w-60"
              />
            </form>

            {/* Cart Drawer Trigger Button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 h-9"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline font-bold text-xs uppercase">Cart</span>
              {totalItems > 0 && (
                <span className="bg-amber-400 text-black font-extrabold text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        categories={categories}
      />
    </>
  );
}
