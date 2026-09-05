"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  variantInfo: string; // e.g. "Color: Chestnut Brown, Size: EU 42"
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (variantId: string, variantInfo?: string) => void;
  updateQuantity: (variantId: string, quantity: number, variantInfo?: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "slipper_store_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [items, isLoaded]);

  // Strict variant matching: exact same productId + variantId + variantInfo (size & color)
  const addToCart = (newItem: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.variantId === newItem.variantId &&
          i.variantInfo === newItem.variantInfo
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentQty = updated[existingIndex].quantity;
        const newQty = Math.min(currentQty + quantity, newItem.stock);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        return [...prevItems, { ...newItem, quantity: Math.min(quantity, newItem.stock) }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string, variantInfo?: string) => {
    setItems((prev) =>
      prev.filter((item) => {
        if (variantInfo) {
          return !(item.variantId === variantId && item.variantInfo === variantInfo);
        }
        return item.variantId !== variantId;
      })
    );
  };

  const updateQuantity = (variantId: string, quantity: number, variantInfo?: string) => {
    if (quantity <= 0) {
      removeFromCart(variantId, variantInfo);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        const isMatch = variantInfo
          ? item.variantId === variantId && item.variantInfo === variantInfo
          : item.variantId === variantId;

        return isMatch
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
