import { prisma } from "@/lib/prisma";
import { CartProvider } from "@/components/cart-context";
import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";

const CATEGORY_ORDER = ["women", "men", "kids", "care-accessories"];

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch active categories and subcategories for header nav & sidebar navigation drawer
  const rawCategories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  // Sort categories in exact requested order: 1. WOMEN, 2. MEN, 3. KIDS, 4. CARE & ACCESSORIES
  const categories = rawCategories.sort((a, b) => {
    const idxA = CATEGORY_ORDER.indexOf(a.slug);
    const idxB = CATEGORY_ORDER.indexOf(b.slug);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <StoreHeader categories={categories} />
        <main className="flex-1">{children}</main>
        <CartDrawer />
        <StoreFooter />
      </div>
    </CartProvider>
  );
}
