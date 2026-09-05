"use server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createProductAction(data: {
  name: string;
  description: string;
  subCategoryId: string;
  isFeatured: boolean;
  images: string[];
  variants: {
    size?: string;
    color?: string;
    sku: string;
    stock: number;
    price: number;
  }[];
}) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const slug = slugify(data.name);

  // Check if slug exists
  const existing = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: finalSlug,
      description: data.description,
      subCategoryId: data.subCategoryId,
      isFeatured: data.isFeatured,
      images: data.images.filter(Boolean),
      variants: {
        create: data.variants.map((v) => ({
          size: v.size || null,
          color: v.color || null,
          sku: v.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          stock: v.stock || 0,
          price: v.price || 0,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
  return product;
}

export async function updateProductAction(
  productId: string,
  data: {
    name: string;
    description: string;
    subCategoryId: string;
    isFeatured: boolean;
    images: string[];
  }
) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      description: data.description,
      subCategoryId: data.subCategoryId,
      isFeatured: data.isFeatured,
      images: data.images.filter(Boolean),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
  return product;
}

export async function deleteProductAction(productId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function addVariantAction(
  productId: string,
  variantData: {
    size?: string;
    color?: string;
    sku: string;
    stock: number;
    price: number;
  }
) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      size: variantData.size || null,
      color: variantData.color || null,
      sku: variantData.sku,
      stock: variantData.stock,
      price: variantData.price,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
  return variant;
}

export async function deleteVariantAction(variantId: string, productId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.productVariant.delete({
    where: { id: variantId },
  });

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}
