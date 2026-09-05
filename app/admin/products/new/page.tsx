"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/app/actions/products";
import { uploadImageAction } from "@/app/actions/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SubCategoryOption {
  id: string;
  name: string;
  categoryName: string;
}

export default function CreateProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);
  const [basePriceDollars, setBasePriceDollars] = useState<number>(99.99);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [variants, setVariants] = useState<
    { size: string; color: string; sku: string; stock: number; priceDollars: number }[]
  >([
    { size: "EU 41", color: "Chestnut Brown", sku: `SLP-${Date.now()}-41`, stock: 15, priceDollars: 99.99 },
    { size: "EU 42", color: "Chestnut Brown", sku: `SLP-${Date.now()}-42`, stock: 15, priceDollars: 99.99 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subcategories for select dropdown
  useEffect(() => {
    fetch("/api/subcategories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubCategories(data);
          if (data[0]) setSubCategoryId(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadImageAction(formData);
      if (res.url) {
        setImageUrl(res.url);
      } else if (res.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: "EU 43",
        color: "Chestnut Brown",
        sku: `SLP-${Date.now()}-${prev.length + 1}`,
        stock: 10,
        priceDollars: basePriceDollars,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !subCategoryId) return;
    setIsSubmitting(true);

    try {
      await createProductAction({
        name,
        description,
        subCategoryId,
        isFeatured,
        images: [imageUrl || "https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=800"],
        variants: variants.map((v) => ({
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock: v.stock,
          price: Math.round(v.priceDollars * 100), // convert dollars to cents integer
        })),
      });

      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight mt-2">Add New Product</h1>
        <p className="text-sm text-muted-foreground">Add a new slipper or care product under a subcategory.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 border p-6 rounded-2xl bg-card">
        {/* Basic Details */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg border-b pb-2">1. Basic Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                required
                placeholder="e.g. Royal Calfskin Velvet Slipper"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subCategoryId">Subcategory *</Label>
              <select
                id="subCategoryId"
                className="w-full h-10 px-3 rounded-md border bg-background text-sm font-medium"
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                required
              >
                {subCategories.length === 0 ? (
                  <option value="">Loading subcategories...</option>
                ) : (
                  subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.categoryName} → {sub.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="basePrice">Default Price ($) *</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                required
                value={basePriceDollars}
                onChange={(e) => setBasePriceDollars(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Product Description *</Label>
              <textarea
                id="description"
                required
                rows={3}
                className="w-full p-3 rounded-md border bg-background text-sm"
                placeholder="Handcrafted slippers with soft shearling lining and durable leather sole..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Cloudinary Image Upload */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Product Image (Cloudinary)</Label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full space-y-1.5">
                  <Input
                    id="imageUrl"
                    placeholder="https://res.cloudinary.com/... or paste image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <Label htmlFor="cloudinary-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border bg-muted hover:bg-muted/80 text-xs font-bold transition-colors">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-primary" /> Upload to Cloudinary
                        </>
                      )}
                    </div>
                  </Label>
                  <input
                    id="cloudinary-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </div>

              {imageUrl && (
                <div className="relative h-28 w-28 rounded-lg overflow-hidden border bg-muted mt-2">
                  <Image src={imageUrl} alt="Uploaded product preview" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 sm:col-span-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isFeatured" className="cursor-pointer font-semibold text-sm">
                Feature on Storefront Homepage Banner
              </Label>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">2. Variants (Sizes & Colors)</h2>
              <p className="text-xs text-muted-foreground">Define different colorways, sizes, and prices ($).</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addVariantRow} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Variant
            </Button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 border rounded-xl bg-muted/30 items-center">
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input
                    value={v.color}
                    placeholder="Color"
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].color = e.target.value;
                      setVariants(updated);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Size</Label>
                  <Input
                    value={v.size}
                    placeholder="Size"
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].size = e.target.value;
                      setVariants(updated);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">SKU Code</Label>
                  <Input
                    value={v.sku}
                    placeholder="SKU"
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].sku = e.target.value;
                      setVariants(updated);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Stock Qty</Label>
                  <Input
                    type="number"
                    value={v.stock}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].stock = parseInt(e.target.value) || 0;
                      setVariants(updated);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={v.priceDollars}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].priceDollars = parseFloat(e.target.value) || 0;
                      setVariants(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end gap-3">
          <Link href="/admin/products">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || isUploading} className="font-bold">
            {isSubmitting ? "Creating..." : "Save Product & Variants"}
          </Button>
        </div>
      </form>
    </div>
  );
}
