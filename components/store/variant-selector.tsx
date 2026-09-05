"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check, Plus, Minus, AlertCircle } from "lucide-react";

export interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  sku: string;
  stock: number;
  price: number; // In cents
}

interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  images: string[];
}

export function VariantSelector({
  product,
  variants,
}: {
  product: ProductDetails;
  variants: Variant[];
}) {
  const { addToCart } = useCart();

  // Extract unique colors and sizes
  const availableColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean))
  ) as string[];

  const availableSizes = Array.from(
    new Set(variants.map((v) => v.size).filter(Boolean))
  ) as string[];

  const [selectedColor, setSelectedColor] = useState<string | null>(
    availableColors[0] || null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    availableSizes[0] || null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedMessage, setAddedMessage] = useState(false);

  // Find exact matching variant for selected color and size
  const exactMatchingVariant = variants.find((v) => {
    const colorMatch = selectedColor ? v.color === selectedColor : true;
    const sizeMatch = selectedSize ? v.size === selectedSize : true;
    return colorMatch && sizeMatch;
  });

  const activeVariant = exactMatchingVariant || variants.find((v) => (selectedColor ? v.color === selectedColor : true)) || variants[0];

  const currentPriceCents = activeVariant?.price ?? 0;
  const currentStock = activeVariant?.stock ?? 0;

  // Handle color change and auto-adjust size if needed
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Check if current selectedSize exists for this new color
    const sizeExistsForColor = variants.some(
      (v) => v.color === color && v.size === selectedSize
    );
    if (!sizeExistsForColor) {
      const validSizeVariant = variants.find((v) => v.color === color && v.size);
      if (validSizeVariant?.size) {
        setSelectedSize(validSizeVariant.size);
      }
    }
  };

  const handleAddToCart = () => {
    if (!activeVariant || currentStock === 0) return;

    // Build specific string representation of selected variant details
    const colorPart = selectedColor || activeVariant.color;
    const sizePart = selectedSize || activeVariant.size;

    const variantDetailsStr = [
      colorPart ? `Color: ${colorPart}` : null,
      sizePart ? `Size: ${sizePart}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    // Ensure variantId uniquely identifies this specific size + color combination
    const effectiveVariantId = activeVariant.id;

    addToCart(
      {
        productId: product.id,
        variantId: effectiveVariantId,
        name: product.name,
        slug: product.slug,
        variantInfo: variantDetailsStr || "Standard",
        price: currentPriceCents,
        image: product.images[0] || "",
        stock: currentStock,
      },
      quantity
    );

    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2500);
  };

  return (
    <div className="space-y-6 border p-6 rounded-xl bg-card">
      {/* Price display */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-foreground">
          {formatCurrency(currentPriceCents)}
        </span>
        {currentStock > 0 ? (
          <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
            In Stock ({currentStock} available)
          </span>
        ) : (
          <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">
            Out of Stock
          </span>
        )}
      </div>

      {/* Color options */}
      {availableColors.length > 0 && (
        <div>
          <label className="text-sm font-semibold block mb-2">
            Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-input bg-background hover:bg-muted text-foreground"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size options */}
      {availableSizes.length > 0 && (
        <div>
          <label className="text-sm font-semibold block mb-2">
            Size: <span className="font-normal text-muted-foreground">{selectedSize}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              const variantForSize = variants.find(
                (v) => v.size === size && (selectedColor ? v.color === selectedColor : true)
              );
              const isOutOfStock = !variantForSize || variantForSize.stock === 0;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  disabled={isOutOfStock}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : isOutOfStock
                      ? "opacity-40 line-through cursor-not-allowed bg-muted"
                      : "border-input bg-background hover:bg-muted text-foreground"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="pt-4 border-t space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold">Quantity:</label>
          <div className="flex items-center border rounded-lg">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || currentStock === 0}
              className="p-2 hover:bg-muted transition-colors rounded-l-lg disabled:opacity-30 cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 font-semibold text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
              disabled={quantity >= currentStock || currentStock === 0}
              className="p-2 hover:bg-muted transition-colors rounded-r-lg disabled:opacity-30 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={currentStock === 0}
          className="w-full h-12 text-base font-bold gap-2 cursor-pointer"
        >
          {addedMessage ? (
            <>
              <Check className="h-5 w-5 text-green-400" /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5" /> Add to Cart (COD)
            </>
          )}
        </Button>

        {currentStock === 0 && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Selected variant is currently out of stock. Select another size/color.</span>
          </div>
        )}
      </div>
    </div>
  );
}
