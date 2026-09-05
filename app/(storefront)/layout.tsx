import { CartProvider } from "@/components/cart-context";
import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <StoreHeader />
        <main className="flex-1">{children}</main>
        <CartDrawer />
        <StoreFooter />
      </div>
    </CartProvider>
  );
}
