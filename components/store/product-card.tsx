import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ProductWithVariants {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  isFeatured: boolean;
  images: string[];
  variants: {
    id: string;
    size: string | null;
    color: string | null;
    sku: string;
    stock: number;
    price: number;
  }[];
}

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const primaryImage =
    product.images[0] ||
    "https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=600";

  // Calculate lowest price among variants in cents
  const variantPrices = product.variants.map((v) => v.price);
  const minPriceCents = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-xl border bg-card text-card-foreground shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs text-xs font-semibold">
            {product.category}
          </Badge>
          {product.isFeatured && (
            <Badge className="bg-amber-500 text-white font-bold text-xs">Featured</Badge>
          )}
        </div>

        {totalStock === 0 && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
            <span className="font-bold text-sm text-destructive uppercase tracking-wider">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t mt-auto">
          <div>
            <span className="text-xs text-muted-foreground block">Price</span>
            <span className="font-bold text-base text-foreground">
              {formatCurrency(minPriceCents)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">
              {product.variants.length} {product.variants.length === 1 ? "option" : "variants"}
            </span>
            <span className="text-xs font-semibold text-primary group-hover:underline">
              View Options →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
