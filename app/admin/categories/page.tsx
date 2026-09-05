import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createCategoryAction,
  createSubCategoryAction,
  toggleCategoryStatusAction,
  toggleSubCategoryStatusAction,
  deleteCategoryAction,
  deleteSubCategoryAction,
} from "@/app/actions/categories";
import { FolderPlus, Layers, Trash2, Power } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const categories = await prisma.category.findMany({
    include: {
      subcategories: {
        include: {
          _count: {
            select: { products: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  async function handleCreateCategory(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (name) {
      await createCategoryAction(name);
    }
  }

  async function handleCreateSubCategory(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    if (name && categoryId) {
      await createSubCategoryAction(name, categoryId);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Categories & Subcategories</h1>
        <p className="text-sm text-muted-foreground">
          Manage dynamic categories (Men, Women, Kids) and subcategories (Slippers, Sandals, Care).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Parent Category Form */}
        <form action={handleCreateCategory} className="border p-6 rounded-2xl bg-card space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2 border-b pb-2">
            <FolderPlus className="h-5 w-5 text-primary" /> Create Parent Category
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input id="categoryName" name="name" required placeholder="e.g. Men, Women, Accessories" />
          </div>
          <Button type="submit" className="w-full font-bold">
            Add Parent Category
          </Button>
        </form>

        {/* Create Subcategory Form */}
        <form action={handleCreateSubCategory} className="border p-6 rounded-2xl bg-card space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2 border-b pb-2">
            <Layers className="h-5 w-5 text-primary" /> Create Subcategory
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="subName">Subcategory Name</Label>
            <Input id="subName" name="name" required placeholder="e.g. Leather Slippers, Slides" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="parentCat">Parent Category</Label>
            <select
              id="parentCat"
              name="categoryId"
              required
              className="w-full h-10 px-3 rounded-md border bg-background text-sm font-medium"
            >
              <option value="">Select Parent Category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="outline" className="w-full font-bold">
            Add Subcategory
          </Button>
        </form>
      </div>

      {/* Category Hierarchy List */}
      <div className="space-y-4">
        <h2 className="font-bold text-xl">Existing Category Hierarchy</h2>

        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground border p-8 rounded-xl text-center">
            No categories created yet. Create one using the forms above.
          </p>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.id} className="border rounded-2xl bg-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-extrabold text-lg">{cat.name}</h3>
                    <span className="text-xs font-mono text-muted-foreground">/{cat.slug}</span>
                    <Badge variant={cat.isActive ? "default" : "outline"} className="text-xs">
                      {cat.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await toggleCategoryStatusAction(cat.id, !cat.isActive);
                      }}
                    >
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                        <Power className="h-3.5 w-3.5" /> Toggle
                      </Button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await deleteCategoryAction(cat.id);
                      }}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Subcategories list */}
                <div className="pl-4 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Subcategories ({cat.subcategories.length})
                  </h4>
                  {cat.subcategories.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No subcategories under {cat.name}.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cat.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 border rounded-xl bg-muted/30 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold block">{sub.name}</span>
                            <span className="text-muted-foreground block text-[11px]">
                              {sub._count.products} product(s)
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <form
                              action={async () => {
                                "use server";
                                await toggleSubCategoryStatusAction(sub.id, !sub.isActive);
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-xs"
                                title="Toggle Status"
                              >
                                <Power className="h-3 w-3" />
                              </Button>
                            </form>

                            <form
                              action={async () => {
                                "use server";
                                await deleteSubCategoryAction(sub.id);
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                title="Delete Subcategory"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
