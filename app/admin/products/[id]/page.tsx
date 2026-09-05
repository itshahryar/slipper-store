import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import {
  updateProductAction,
  deleteProductAction,
  addVariantAction,
  deleteVariantAction,
} from "@/app/actions/products";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  async function handleUpdateProduct(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as any;
    const basePrice = parseFloat(formData.get("basePrice") as string) || 0;
    const isFeatured = formData.get("isFeatured") === "on";
    const image1 = formData.get("image1") as string;

    await updateProductAction(id, {
      name,
      description,
      category,
      basePrice,
      isFeatured,
      images: [image1].filter(Boolean),
    });

    redirect("/admin/products");
  }

  async function handleDeleteProduct() {
    "use server";
    await deleteProductAction(id);
    redirect("/admin/products");
  }

  async function handleAddVariant(formData: FormData) {
    "use server";
    const size = formData.get("size") as string;
    const color = formData.get("color") as string;
    const sku = (formData.get("sku") as string) || `SKU-${Date.now()}`;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const price = parseFloat(formData.get("price") as string) || undefined;

    await addVariantAction(id, {
      size,
      color,
      sku,
      stock,
      price,
    });
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">{product.name}</h1>
          <p className="text-xs text-muted-foreground font-mono">ID: {product.id} | Slug: /{product.slug}</p>
        </div>

        <form action={handleDeleteProduct}>
          <Button variant="destructive" size="sm" className="gap-1.5 text-xs font-semibold">
            <Trash2 className="h-3.5 w-3.5" /> Delete Product
          </Button>
        </form>
      </div>

      {/* Main Details Form */}
      <form action={handleUpdateProduct} className="border p-6 rounded-2xl bg-card space-y-6">
        <h2 className="font-bold text-lg border-b pb-2">Edit Basic Product Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" defaultValue={product.name} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue={product.category}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm font-medium"
            >
              <option value="LEATHER_SLIPPERS">Leather Slippers</option>
              <option value="PLUSH_HOME_SLIPPERS">Plush Home Slippers</option>
              <option value="SLIDE_SANDALS">Slide Sandals</option>
              <option value="CARE_AND_POLISH">Care & Polish</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="basePrice">Base Price ($)</Label>
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              step="0.01"
              defaultValue={product.basePrice}
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={product.description}
              className="w-full p-3 rounded-md border bg-background text-sm"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="image1">Primary Image URL</Label>
            <Input id="image1" name="image1" defaultValue={product.images[0] || ""} />
          </div>

          <div className="flex items-center gap-2 pt-2 sm:col-span-2">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              defaultChecked={product.isFeatured}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isFeatured" className="cursor-pointer font-semibold text-sm">
              Feature on Storefront Homepage Banner
            </Label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="font-bold">
            Save Product Changes
          </Button>
        </div>
      </form>

      {/* Variants & Stock Management */}
      <div className="border p-6 rounded-2xl bg-card space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="font-bold text-lg">Product Variants & Inventory ({product.variants.length})</h2>
            <p className="text-xs text-muted-foreground">Manage colors, sizes, SKUs, and stock quantities.</p>
          </div>
        </div>

        {/* Existing Variants Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-2.5">Color</th>
                <th className="px-4 py-2.5">Size</th>
                <th className="px-4 py-2.5">SKU</th>
                <th className="px-4 py-2.5">Stock</th>
                <th className="px-4 py-2.5">Price</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {product.variants.map((v: any) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-semibold">{v.color || "Default"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.size || "One Size"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{v.sku}</td>
                  <td className="px-4 py-3 font-bold">{v.stock} units</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(v.price ?? product.basePrice)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await deleteVariantAction(v.id, product.id);
                      }}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Variant Sub-form */}
        <div className="pt-4 border-t space-y-4">
          <h3 className="font-bold text-sm">Add New Variant</h3>
          <form action={handleAddVariant} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div>
              <Label className="text-xs">Color</Label>
              <Input name="color" placeholder="e.g. Navy Blue" />
            </div>
            <div>
              <Label className="text-xs">Size</Label>
              <Input name="size" placeholder="e.g. EU 42" />
            </div>
            <div>
              <Label className="text-xs">SKU</Label>
              <Input name="sku" placeholder="SKU-1002" />
            </div>
            <div>
              <Label className="text-xs">Stock Qty</Label>
              <Input name="stock" type="number" defaultValue="10" required />
            </div>
            <div>
              <Button type="submit" variant="outline" className="w-full font-semibold gap-1 text-xs">
                <Plus className="h-4 w-4" /> Add Variant
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
