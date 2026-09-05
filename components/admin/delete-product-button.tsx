"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteProductAction } from "@/app/actions/products";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProductAction(productId);
      setIsOpen(false);
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs font-semibold"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete Product
      </Button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product?"
        description={`Are you sure you want to delete "${productName}"? This action cannot be undone and will permanently remove all product variants.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}
