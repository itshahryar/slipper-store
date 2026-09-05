"use server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(name: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const slug = slugify(name);
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      isActive: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return category;
}

export async function createSubCategoryAction(name: string, categoryId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const slug = slugify(name);
  const subCategory = await prisma.subCategory.create({
    data: {
      name,
      slug,
      categoryId,
      isActive: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return subCategory;
}

export async function toggleCategoryStatusAction(categoryId: string, isActive: boolean) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.category.update({
    where: { id: categoryId },
    data: { isActive },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function toggleSubCategoryStatusAction(subCategoryId: string, isActive: boolean) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.subCategory.update({
    where: { id: subCategoryId },
    data: { isActive },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.category.delete({
    where: { id: categoryId },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function deleteSubCategoryAction(subCategoryId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.subCategory.delete({
    where: { id: subCategoryId },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
}
