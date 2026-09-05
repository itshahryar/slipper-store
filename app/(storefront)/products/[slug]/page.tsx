import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { VariantSelector } from "@/components/store/variant-selector";
import { Badge } from "@/components/ui/badge";
import { Truck, ShieldCheck, ArrowLeft, RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      subCategory: {
        include: {
          category: true,
        },
      },
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  const primaryImage =
    product.images[0] ||
    "https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Storefront
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-muted border">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Thumbnail Gallery if multiple images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Product Guarantee Cards */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            <div className="p-3 border rounded-xl bg-card text-center space-y-1">
              <Truck className="h-5 w-5 mx-auto text-primary" />
              <span className="block text-xs font-semibold">Cash on Delivery</span>
              <span className="block text-[11px] text-muted-foreground">Pay upon receipt</span>
            </div>
            <div className="p-3 border rounded-xl bg-card text-center space-y-1">
              <RotateCcw className="h-5 w-5 mx-auto text-primary" />
              <span className="block text-xs font-semibold">7-Day Exchange</span>
              <span className="block text-[11px] text-muted-foreground">Free size swap</span>
            </div>
            <div className="p-3 border rounded-xl bg-card text-center space-y-1">
              <ShieldCheck className="h-5 w-5 mx-auto text-primary" />
              <span className="block text-xs font-semibold">Genuine Quality</span>
              <span className="block text-[11px] text-muted-foreground">100% Handcrafted</span>
            </div>
          </div>
        </div>

        {/* Right Column: Product Details & Variant Selector */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold">
                {product.subCategory.category.name} → {product.subCategory.name}
              </Badge>
              {product.isFeatured && (
                <Badge className="bg-amber-500 text-white text-xs font-bold">
                  Featured Choice
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {product.name}
            </h1>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed border-b pb-6">
            {product.description}
          </p>

          {/* Dynamic Variant Selector & Add to Cart */}
          <VariantSelector
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              images: product.images,
            }}
            variants={product.variants}
          />
        </div>
      </div>
    </div>
  );
}
