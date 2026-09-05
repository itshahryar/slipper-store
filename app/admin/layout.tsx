import { getAdminSession } from "@/lib/auth";
import { logoutAdminAction } from "@/app/actions/admin-auth";
import Link from "next/link";
import {
  Footprints,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If viewing admin login page or unauthenticated
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-b md:border-r border-border p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Footprints className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight block leading-none">
                SLIPPER ADMIN
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mt-0.5">
                {session.email}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors text-foreground"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors text-foreground"
            >
              <Layers className="h-4 w-4 text-primary" /> Categories
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors text-foreground"
            >
              <Package className="h-4 w-4 text-primary" /> Products & Inventory
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors text-foreground"
            >
              <ShoppingBag className="h-4 w-4 text-primary" /> COD Orders
            </Link>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span>View Public Store</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <form action={logoutAdminAction}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:bg-destructive/10 text-xs font-semibold gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
