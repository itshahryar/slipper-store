"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CategoryWithSub {
  id: string;
  name: string;
  slug: string;
  subcategories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryWithSub[];
}

export function NavigationDrawer({ isOpen, onClose, categories }: NavigationDrawerProps) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    setExpandedCategoryId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-[320px] sm:max-w-[350px] bg-background shadow-2xl flex flex-col font-sans">
          {/* Elegant Top Header */}
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-muted text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main List Section with Clean Dividers */}
          <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-border/60">
            {categories.map((category) => {
              const isExpanded = expandedCategoryId === category.id;
              const hasSub = category.subcategories && category.subcategories.length > 0;

              return (
                <div key={category.id} className="py-1">
                  {/* Whole row is clickable to open or close menu below */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between py-3.5 px-1 text-left font-bold text-sm tracking-wider text-foreground hover:text-primary transition-colors uppercase cursor-pointer"
                  >
                    <span>{category.name}</span>
                    {hasSub ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-foreground/80 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-foreground/80 shrink-0" />
                      )
                    ) : (
                      <ChevronRight className="h-4 w-4 text-foreground/80 shrink-0" />
                    )}
                  </button>

                  {/* Subcategories Expandable Accordion */}
                  {hasSub && isExpanded && (
                    <div className="pb-3 pl-3 space-y-2 animate-in fade-in-50 duration-200">
                      <Link
                        href={`/collections/${category.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between py-1.5 text-xs font-bold text-primary hover:underline uppercase"
                      >
                        <span>All {category.name} Products</span>
                        <span>&rarr;</span>
                      </Link>

                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/collections/${sub.slug}`}
                          onClick={onClose}
                          className="flex items-center justify-between py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                        >
                          <span>{sub.name}</span>
                          <span className="text-[11px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Shop &rarr;
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Social Icons Grid Footer Bar */}
          <div className="border-t border-border/80 grid grid-cols-4 divide-x divide-border/80 bg-muted/20 text-center">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="py-3 flex items-center justify-center text-foreground hover:text-primary hover:bg-muted/50 transition-colors"
              title="Facebook"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="py-3 flex items-center justify-center text-foreground hover:text-primary hover:bg-muted/50 transition-colors"
              title="Instagram"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="py-3 flex items-center justify-center text-foreground hover:text-primary hover:bg-muted/50 transition-colors"
              title="TikTok"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.36 1.51-1.41 2.51-.08 1.19.46 2.37 1.41 3.04.97.68 2.27.79 3.32.28.98-.46 1.66-1.46 1.78-2.53.07-2.12.02-4.24.03-6.36V.02z" />
              </svg>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="py-3 flex items-center justify-center text-foreground hover:text-primary hover:bg-muted/50 transition-colors"
              title="YouTube"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
