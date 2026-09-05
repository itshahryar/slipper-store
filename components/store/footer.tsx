import Link from "next/link";
import { Footprints, Truck, RotateCcw, ShieldCheck, Heart } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="bg-muted/40 border-t mt-auto">
      {/* Guarantees section */}
      <div className="border-b bg-background/50 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Cash on Delivery</h4>
              <p className="text-xs text-muted-foreground">Pay conveniently when your order arrives at your door.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Free Size Exchange</h4>
              <p className="text-xs text-muted-foreground">Slipper doesn't fit? We swap sizes hassle-free within 7 days.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Guaranteed Craftsmanship</h4>
              <p className="text-xs text-muted-foreground">Every pair is selected for premium materials and foot ergonomic comfort.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Footprints className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">SLIPPER VAULT</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              The single-category online destination for fine slippers, ergonomic slide sandals, plush house slippers, and authentic leather care kits.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-sm mb-3">Featured Collections</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/collections/women" className="hover:text-foreground">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link href="/collections/men" className="hover:text-foreground">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link href="/collections/kids" className="hover:text-foreground">
                  Kids Collection
                </Link>
              </li>
              <li>
                <Link href="/collections/care-accessories" className="hover:text-foreground">
                  Care & Polish Kits
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-sm mb-3">Customer Info</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Payment: Cash on Delivery (COD)</li>
              <li>Shipping: 2-4 Business Days</li>
              <li>Support Email: support@slipperstore.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Slipper Vault. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Dedicated Single-Category Store <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
