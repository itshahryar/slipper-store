"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

interface CollectionSortSelectProps {
  defaultValue: string;
  onChange?: (value: string) => void;
}

export function CollectionSortSelect({ defaultValue, onChange }: CollectionSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (onChange) {
      onChange(value);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", value);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-primary" />
      <span className="uppercase tracking-wider hidden sm:inline">Sort:</span>
      <select
        defaultValue={defaultValue}
        onChange={handleSortChange}
        className="bg-background border rounded-md px-2.5 py-1 text-xs font-semibold uppercase cursor-pointer"
      >
        <option value="newest">Newest Arrivals</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Alphabetical (A-Z)</option>
      </select>
    </div>
  );
}
