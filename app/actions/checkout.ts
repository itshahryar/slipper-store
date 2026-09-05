"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface GuestCheckoutItem {
  variantId: string;
  quantity: number;
}

export interface GuestCheckoutFormData {
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  items: GuestCheckoutItem[];
}

export async function createGuestOrder(formData: GuestCheckoutFormData) {
  try {
    if (!formData.customerName || !formData.customerPhone || !formData.address) {
      return { error: "Please fill out all required delivery fields." };
    }

    if (!formData.items || formData.items.length === 0) {
      return { error: "Your cart is empty." };
    }

    // Fetch variants and verify stock
    const variantIds = formData.items.map((i) => i.variantId);
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (dbVariants.length !== formData.items.length) {
      return { error: "Some items in your cart are no longer available." };
    }

    let calculatedTotalCents = 0;
    const orderItemsToCreate = [];

    for (const item of formData.items) {
      const variant = dbVariants.find((v: any) => v.id === item.variantId);
      if (!variant) {
        return { error: "Invalid item selected." };
      }

      if (variant.stock < item.quantity) {
        return {
          error: `Insufficient stock for "${variant.product.name}". Available: ${variant.stock}`,
        };
      }

      const unitPriceCents = variant.price;
      const subtotalCents = unitPriceCents * item.quantity;
      calculatedTotalCents += subtotalCents;

      const variantDetailsStr = [
        variant.color ? `Color: ${variant.color}` : null,
        variant.size ? `Size: ${variant.size}` : null,
      ]
        .filter(Boolean)
        .join(", ");

      orderItemsToCreate.push({
        productId: variant.productId,
        variantId: variant.id,
        productSnapshot: variant.product.name,
        variantSnapshot: variantDetailsStr || "Standard",
        unitPrice: unitPriceCents,
        quantity: item.quantity,
        subtotal: subtotalCents,
      });
    }

    // Generate unique order number (e.g. SLP-84920)
    const randomSuffix = crypto.randomInt(10000, 99999);
    const orderNumber = `SLP-${randomSuffix}`;

    // Execute order creation & stock reduction in a transaction
    const createdOrder = await prisma.$transaction(async (tx: any) => {
      // 1. Create order & order items
      const order = await tx.order.create({
        data: {
          orderNumber,
          guestName: formData.customerName,
          guestPhone: formData.customerPhone,
          guestAddress: formData.address,
          note: formData.notes || null,
          totalAmount: calculatedTotalCents,
          status: "PENDING",
          items: {
            create: orderItemsToCreate,
          },
        },
      });

      // 2. Reduce stock for each variant
      for (const item of formData.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return { success: true, orderNumber: createdOrder.orderNumber };
  } catch (error: unknown) {
    console.error("Guest checkout error:", error);
    return { error: "An unexpected error occurred while placing your order. Please try again." };
  }
}
